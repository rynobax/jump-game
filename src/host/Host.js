import React, { Component } from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import LobbyList from '../lobby/LobbyList';
import * as firebase from 'firebase';
import SimplePeer from 'simple-peer';
import HostGame from './HostGame';
import { OnInputChange, DefaultInput } from '../game/Input';

const roomCodeOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRoomCode() {
  let code = '';
  for(let i=0; i<4; i++){
    const ndx = Math.floor(Math.random() * roomCodeOptions.length);
    code += roomCodeOptions[ndx];
  }
  return code;
}

function createRoom(room,){
  return room.set({
    'createdAt': firebase.database.ServerValue.TIMESTAMP
  });
}

function getOpenRoom(database){
  return new Promise((resolve, reject) => {
    const code = generateRoomCode();
    const room = database.ref('rooms/'+code);
    room.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      if (roomData == null) {
        // Room does not exist
        createRoom(room).then(resolve(code));
      } else {
        const roomTimeout = 1800000; // 30 min
        const now = Date.now();
        const msSinceCreated = now - roomData.createdAt;
        if (msSinceCreated > roomTimeout) {
          // It is an old room so wipe it and create a new one
          room.remove().then(() => createRoom(room)).then(resolve(code));
        } else {
          // The room is in use so try a different code
          resolve(getOpenRoom(database));
        }
      }
    })
  });
}

class Host extends Component {
  constructor(props){
    super(props);
    const players = {};
    players[props.name] = {
      host: true,
      ready: false,
      input: DefaultInput(),
      // Peer object with blank methods so I don't have to
      // filter when I iterate over players
      peer: {
        send: () => {}
      }
    }
    this.state = {
      players: players,
      code: null,
      gameStarted: false
    }

    this.database = null;
    this.hostName = props.name;

    this.copyPlayers = () => Object.assign({}, this.state.players);

    this.playersToArray = () => {
      const playersArr = [];
      for (const playerName in this.state.players){
        playersArr.push({
          name: playerName,
          input: this.state.players[playerName].input,
          peer: this.state.players[playerName].peer,
          ready: this.state.players[playerName].ready
        });
      }
      return playersArr;
    }

    this.getPlayersForGame = () => {
      // Don't send peer info
      const players = {};
      for(const playerName in this.state.players) {
        players[playerName] = {
          input: this.state.players[playerName].input
        }
      }
      return players;
    }

    // Send message to all players
    this.broadcast = (obj) => {
      for(const playerName in this.state.players){
        const peer = this.state.players[playerName].peer;
        if(peer.connected) peer.send(JSON.stringify(obj));
      }
    }

    this.broadcastPlayers = () => {
      this.broadcast({
        type: 'players',
        players: this.playersToArray().map((e) => {
          return {
            name: e.name,
            ready: e.ready
          }
        })
      })
    }

    this.handleData = (playerName, data) => {
      switch(data.type){
        case 'ready':
          this.handleReady(playerName, data.ready);
          break;
        case 'input':
          this.handleInput(playerName, data.input);
          break;
        case 'connected':
          this.handleConnected(playerName);
          break;
        default:
          throw Error('Unkown input ', data.type);
      }
      return;
    }

    // Input from players
    this.handleInput = (playerName, input) => {
      const playersCopy = this.copyPlayers();
      for (const key in input) {
        playersCopy[playerName].input[key] = input[key];
      }
      this.setState({players: playersCopy});
    }

    // Input from host
    OnInputChange((input) => {
      this.handleInput(this.hostName, input);
    });

    this.handleConnected = (playerName) => {
      // Workaround for https://github.com/feross/simple-peer/issues/178
      this.broadcastPlayers();
    }
    
    this.handleReady = (name, ready) => {
      const p = this.copyPlayers();
      p[name].ready = ready;
      this.setState({
        players: p
      }, () => {
        // Update players of everyone's status
        this.broadcastPlayers();

        // After updating the players ready status, check if the game should start
        let playerCount = 0;
        const playersReady = [];
        for(const playerName in this.state.players){
          playerCount++;
          playersReady.push(this.state.players[playerName].ready);
        }
        if(playerCount > 0 && playersReady.every(e => e === true)){
          // We have enough players and they are all ready
          this.setState({gameStarted: true});
          
          // Send start game to all peers
          this.broadcast({type: 'startGame'});

          // Delete the room
          this.database.ref('/rooms/'+this.state.code).remove();
        }
      });
    }
  }

  componentDidMount(){
    const database = firebase.database();
    this.database = database;
    getOpenRoom(database).then((code) => {
      // Display room code
      this.setState({code: code});

      // Players signaling
      database.ref('/rooms/'+code+'/players').on('child_added', ({key: playerName}) => {
        // Create Peer channel
        const peer = new SimplePeer();

        // Upload Host signals
        const signalDataRef = database.ref('/rooms/'+code+'/host/'+playerName);
        peer.on('signal', (signalData) => {
          const newSignalDataRef = signalDataRef.push();
          newSignalDataRef.set({
            data: JSON.stringify(signalData)
          });
        });
        
        // Add player to player list
        // Use fake peer so broadcasts don't fail
        const playersCopy = this.copyPlayers();
        playersCopy[playerName] = {
          peer: peer,
          //_peer: peer,
          ready: false,
          input: DefaultInput()
        }
        this.setState({players: playersCopy}, () => {
          // And notify other players
          this.broadcastPlayers();
        });

        // Listen for player singnaling data
        const playerRef = database.ref('/rooms/'+code+'/players/'+playerName);
        playerRef.on('child_added', (res) => peer.signal(JSON.parse(res.val().data)));

        // Listen to messages from player
        peer.on('data', (data) => {
          this.handleData(playerName, JSON.parse(data));
        });

        // Player disconnect
        peer.on('close', () => {
          // Delete local ref to player
          const playersCopy = Object.assign({}, this.state.players);
          delete playersCopy[playerName];
          this.setState({players: playersCopy});

          // Delete remote ref to player
          playerRef.remove();

          // Remove callbacks
          playerRef.off('child_added');

          // Delete remote signaling to player
          signalDataRef.remove();

          // Delete peer reference
          peer.destroy();
        });
      });
    });
  }

  render() {
    const codeNode = () => {
      if(this.state.code){
        return this.state.code;
      } else {
        return <CircularProgress />;
      }
    }

    // Push players into array so it's easier to work with in the game
    const playersArr = this.playersToArray();

    if(this.state.gameStarted){
      // Display the game once it starts
      return <HostGame players={this.getPlayersForGame()} broadcast={this.broadcast}/>
    } else {
      // Not enough players or not all players are ready
      return (
        <div>
          <h1>Room Code: {codeNode()}</h1>
          <LobbyList players={playersArr} checkFunction={this.handleReady.bind(this, this.hostName)}/>
        </div>
      )
    }
  }
}

export default Host;
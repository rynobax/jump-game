import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import LobbyList from './LobbyList';
import * as firebase from 'firebase';
import SimplePeer from 'simple-peer';
import Game from './Game';

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
    this.state = {
      players: {},
      code: null,
      gameStarted: false
    }
  }

  componentDidMount(){
    const database = firebase.database();
    getOpenRoom(database)
      .then((code) => {
        this.setState({code: code});

        // Players signaling
        const playersRef = database.ref('/rooms/'+code+'/players');
        playersRef.on('child_added', (res) => {
          const playerName = res.key;

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
          
          // Add player to state
          const playersCopy = Object.assign({}, this.state.players);
          playersCopy[playerName] = {
            peer: peer,
            input: {
              jumpButton: false,
              ready: false
            }
          }
          this.setState({players: playersCopy});

          // Listen for player singnaling data
          const playerRef = database.ref('/rooms/'+code+'/players/'+playerName);
          playerRef.on('child_added', (res) => peer.signal(JSON.parse(res.val().data)));

          peer.on('data', (data) => {
            // The data is a json object to be merged into the players input
            const input = JSON.parse(data);
            const playersCopy = Object.assign({}, this.state.players);
            const player = playersCopy[playerName];
            for (const key in input) {
              player.input[key] = input[key];
            }
            this.setState({players: playersCopy}, () => {
              if(!this.state.gameStarted){
              // After updating the players, if the game hasn't started, check if it should start
                let playerCount = 0;
                const playersReady = [];
                for(const playerName in this.state.players){
                  playerCount++;
                  playersReady.push(this.state.players[playerName].input.ready);
                }
                if(playerCount > 0 && playersReady.every(e => e === true)){
                  // We have players and they are all ready
                  this.setState({gameStarted: true});
                  
                  // Send ready to all peers
                  for(const playerName in this.state.players){
                    this.state.players[playerName].peer.send('startGame');
                  }
                }
              }
            });
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
      })
  }

  render() {
    const codeNode = () => {
      if(this.state.code){
        return this.state.code;
      } else {
        return <CircularProgress />;
      }
    }
    const playersArr = [];
    for (const playerName in this.state.players){
      playersArr.push({
        name: playerName,
        input: this.state.players[playerName].input
      });
    }

    if(this.state.gameStarted){
      return <Game players={playersArr}/>
    } else {
      // Not enough players or not all players are ready
      return (
        <Paper
          style={{
            height: 400,
            width: 400,
            margin: 'auto',
            marginTop: 25,
            padding: 20,
            textAlign: 'center'
        }}>
          <h1>Room Code: {codeNode()}</h1>
          {this.state.gameType}
          <LobbyList players={playersArr} gameType={this.props.gameType}/>
        </Paper>
      )
    }
  }
}

export default Host;
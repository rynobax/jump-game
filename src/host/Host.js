import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import LobbyList from './LobbyList';
  
const roomCodeOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateRoomCode() {
  let code = '';
  for(let i=0; i<4; i++){
    const ndx = Math.floor(Math.random() * roomCodeOptions.length);
    code += roomCodeOptions[ndx];
  }
  return code;
}

function getUniqueRoomCode(tempPeer){
  return new Promise((resolve, reject) => {
    const code = generateRoomCode();
    tempPeer.on('error', (err) => {
      // We can't connect to a peer at this code, so it must be free
      if(err.type === 'peer-unavailable') {
        resolve(code);
      } else {
        reject(err);
      }
    });

    const connection = tempPeer.connect(code);
    connection.on('open', () => {
      // We connected to a peer at this code, so it is not free
      connection.close();
      resolve(getUniqueRoomCode(tempPeer))
    });
  });
}

function handleConnection(peer, dataConnection) {
  const {name} = dataConnection.metadata;

  const playerConnection = peer.connect(dataConnection.peer);

  // Add new player to list
  this.setState({players: this.state.players.concat({
    name: name,
    ready: false,
    connection: playerConnection,
    input: {
      jump: false
    }
  })});

  dataConnection.on('open', () => {
    console.log('open');
  dataConnection.send('test');
  })
  dataConnection.send('test');

  playerConnection.on('open', () => {
    playerConnection.on('data', (data) => {
      if(data === 'ready'){
        this.setState({players: this.state.players.map(e => {
          if(e.name === name){
            e.ready = true;
          }
          return e;
        })}, () => {
          // If every player is ready start the game
          console.log('players: ', this.state.players);
          if(this.state.players.every(e => e.ready === true)){
            console.log('sending');
            this.state.players.forEach((player) => {
              console.log('player: ', player);
              player.connection.send('gameStarted');
            })
          }
        });
      }

      else if(data === 'unready'){
        this.setState({players: this.state.players.map(e => {
          if(e.name === name){
            e.ready = false;
          } 
          return e;
        })});
      }

      else if(data === 'jumpButtonDown'){
        this.setState({players: this.state.players.map(e => {
          if(e.name === name){
            e.input.jump = true;
          } 
          return e;
        })});
      }

      else if(data === 'jumpButtonUp'){
        this.setState({players: this.state.players.map(e => {
          if(e.name === name){
            e.input.jump = false;
          } 
          return e;
        })});
      }
    });
  });

  playerConnection.on('playerConnection error', console.error);
  dataConnection.on('dataConnection error', console.error);
}


class Host extends Component {
  constructor(){
    super();
    this.state = {
      code: null,
      players: []
    }
  }

  componentDidMount(){
    // tempPeer is used for checking if a host already exists
    const peer = new Peer(
      'wss://webrtc-p2p-broker.herokuapp.com', // You can use this broker if you don't want to set one up
      {
        binaryType: 'arraybuffer',
        video: false,
        audio: false
      }
    );
    console.log('peer: ', peer);
    peer.listen();
    peer.onroute = function(route) {
      // This is our routing address from the broker
      // It's used by peers who wish to connect with us
      console.log('route:', route);
    };
    //this.setState({code: code});
  }

  render() {
    const codeNode = () => {
      if(this.state.code){
        return this.state.code;
      } else {
        return <CircularProgress />;
      }
    }
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
        <LobbyList players={this.state.players} />
      </Paper>
    )
  }
}

export default Host;
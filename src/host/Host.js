import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import LobbyList from './LobbyList';
import * as firebase from 'firebase';
import SimplePeer from 'simple-peer';

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
        const roomTimeout = 3600000; // 1 hour
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
  constructor(){
    super();
    this.state = {
      players: [],
      code: null
    }
  }

  componentDidMount(){
    const database = firebase.database();
    getOpenRoom(database)
      .then((code) => {
        this.setState({code: code});
        const peer = new SimplePeer({initiator: true});

        // Host signaling
        const signalDataRef = database.ref('/rooms/'+code+'/host');
        peer.on('signal', (signalData) => {
          console.log('signalData: ', signalData);
          console.log('string: ', JSON.stringify(signalData));
          const newSignalDataRef = signalDataRef.push();
          newSignalDataRef.set({
            data: JSON.stringify(signalData)
          });
        });

        // Players signaling
        const playersRef = database.ref('/rooms/'+code+'/players/');
        playersRef.on('child_added', (res) => {
          const player = res.key;
          console.log('player: ', player);
          const playerRef = database.ref('/rooms/'+code+'/players/'+player);
          playerRef.on('child_added', (res) => {
            console.log('data.val().data: ', res.val().data);
            const signal = JSON.parse(res.val().data);
            console.log('signal: ', signal);
            peer.signal(signal);
          })
        });

        // Connecting
        peer.on('connect', function () {
          // wait for 'connect' event before using the data channel
          peer.send('hey player, how is it going?')
        });

        // Data
        peer.on('data', function (data) {
          // got a data channel message
          console.log('got a message from player: ' + data)
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
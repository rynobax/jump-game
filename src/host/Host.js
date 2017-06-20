import React, { Component } from 'react';
import Peer from 'peerjs';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
  
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

class Host extends Component {
  constructor(){
    super();
    this.state = {
      code: null,
      peer: null,
      input: false
    }
  }

  componentDidMount(){
    const tempPeer = new Peer({key: 'tdrp04ytylr0y66r', debug: 0});
    getUniqueRoomCode(tempPeer).then((code) => {
      tempPeer.destroy();
      const peer = new Peer(code, {key: 'tdrp04ytylr0y66r'});
      this.setState({code: code, peer: peer});
      peer.on('connection', (dataConnection) => {
        console.log('dataConnection: ', dataConnection);
        dataConnection.on('data', (data) => {
          console.log('data: ', data);
        });
      });
    })
    .catch(console.error);
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
      </Paper>
    )
  }
}

export default Host;
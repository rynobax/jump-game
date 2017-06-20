import React, { Component } from 'react';
import Peer from 'peerjs';
  
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
      peer: null
    }
  }

  componentDidMount(){
    const tempPeer = new Peer({key: 'tdrp04ytylr0y66r', debug: 0});
    getUniqueRoomCode(tempPeer).then((code) => {
      tempPeer.destroy();
      const peer = new Peer(code, {key: 'tdrp04ytylr0y66r'});
      this.setState({code: code, peer: peer});
    })
    .catch(console.error);
  }

  render() {
    return (
      <div>
        Code: {this.state.code}
      </div>
    )
  }
}

export default Host;
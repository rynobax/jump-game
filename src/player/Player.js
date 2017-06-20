import React, { Component } from 'react';
import Peer from 'peerjs';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Controller from './Controller';

class Player extends Component {
  constructor() {
    super();
    this.state = {
      peer: new Peer({key: 'tdrp04ytylr0y66r'}),
      code: '',
      name: '',
      joined: false,
      dataConnection: null,
      error: ''
    }
  }

  joinGame = () => {
    this.setState({error: ''});
    const {code, peer, name} = this.state;
    const dataConnection = peer.connect(code, {metadata: {name: name}});
    const timeout = setTimeout(() => {
      this.setState({error: 'Cannot connect to room ' + code});
    }, 3000)
    dataConnection.on('open', () => {
      clearTimeout(timeout);
      this.setState({joined: true, dataConnection: dataConnection});
    });
    dataConnection.on('close', () => {
      this.setState({joined: false, dataConnection: null, code: '', error: 'Lost connection to host'});
    });
  }

  render() {
    if(this.state.joined){
      return <Controller dataConnection={this.state.dataConnection}/>
    } else {
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
          <h1>Join a Game</h1>
          <TextField
            hintText='Room Code'
            floatingLabelText='Room Code'
            maxLength='4'
            value={this.state.code}
            onChange={(_, v) => this.setState({code: v.toUpperCase()})}
            errorText={this.state.error}
          />
          <TextField
            hintText='Username'
            floatingLabelText='Username'
            maxLength='16'
            value={this.state.name}
            onChange={(_, v) => this.setState({name: v})}
          />
          <br/>
          <RaisedButton
            label='Join'
            primary={true}
            onClick={this.joinGame}
          />
        </Paper>
      );
    }
  }
}

export default Player;
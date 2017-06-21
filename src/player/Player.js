import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Controller from './Controller';
import Checkbox from 'material-ui/Checkbox';

class Player extends Component {
  constructor() {
    super();
    this.state = {
      code: '',
      name: '',
      connected: false,
      gameStarted: false,
      error: ''
    }

    this.dataConnection = null;
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
      this.setState({connected: true});
      this.dataConnection = dataConnection;
    });
    dataConnection.on('close', () => {
      this.setState({connected: false, code: '', error: 'Lost connection to host'});
      this.dataConnection = null;
    });
    dataConnection.on('data', (data) => {
      console.log('data: ', data);
      if(data === 'gameStarted') {
        this.setState({gameStarted: true});
      }
      
      else if(data === 'gameEnded') {
        this.setState({gameStarted: false});
      }
    });
  }

  render() {
    if(this.state.connected){
      if(this.state.gameStarted){
        return (
          <Controller 
            jumpButtonDown={() => this.dataConnection.send('jumpButtonDown')}
            jumpButtonUp={() => this.dataConnection.send('jumpButtonUp')}
          />
        )
      } else {
        return (
          <Checkbox
            label="Ready"
            onCheck={(_, checked) => {
              if(checked) {
                this.dataConnection.send('ready');
              } else {
                this.dataConnection.send('unready');
              }
            }}
          />
        )
      }
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
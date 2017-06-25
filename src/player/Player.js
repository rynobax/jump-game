import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Controller from './Controller';
import Checkbox from 'material-ui/Checkbox';
import * as firebase from 'firebase';
import SimplePeer from 'simple-peer';

class Player extends Component {
  constructor() {
    super();
    this.state = {
      code: '',
      name: '',
      connected: false,
      gameStarted: false,
      error: '',
      database: firebase.database()
    }

    this.dataConnection = null;
  }

  joinGame = () => {
    this.setState({error: ''});
    const {code, database, name} = this.state;
    const nameRef = database.ref('/rooms/'+code+'/players/'+name);
    nameRef.once('value').then((data) => {
      const val = data.val();
      if (val) {
        // Name is taken
        return this.setState({error: 'Name is taken'});
      } else {
        const peer = new SimplePeer();

        // Sending signal
        peer.on('signal', (signalData) => {
          console.log('signalData: ', signalData);
          const newSignalDataRef = nameRef.push();
          newSignalDataRef.set({
            data: JSON.stringify(signalData)
          });
        });

        // Recieving signal
        const hostSignalRef = database.ref('/rooms/'+code+'/host');
        hostSignalRef.on('child_added', (res) => {
          console.log('data.val().data: ', res.val().data);
          const signal = JSON.parse(res.val().data);
          console.log('signal: ', signal);
          peer.signal(signal);
        });

        // Connecting
        peer.on('connect', function () {
          // wait for 'connect' event before using the data channel
          peer.send('hey host, how is it going?')
        });

        // Data
        peer.on('data', function (data) {
          // got a data channel message
          console.log('got a message from host: ' + data)
        });
      }
    })
  }

  render() {
    if(this.state.connected){
      if(this.state.gameStarted){
        return (
          <div/>
          //<Controller />
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
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

    this.peer = null;

    this.sendInputFunction = (inputName) => {
      return (value) => {
        this.peer.send('{"'+inputName+'": '+value+'}');
      }
    }
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
        const peer = new SimplePeer({initiator: true});
        this.peer = peer;

        // Sending signal
        peer.on('signal', (signalData) => {
          const newSignalDataRef = nameRef.push();
          newSignalDataRef.set({
            data: JSON.stringify(signalData)
          });
        });

        // Recieving signal
        const hostSignalRef = database.ref('/rooms/'+code+'/host/'+name);
        hostSignalRef.on('child_added', (res) => {
          peer.signal(JSON.parse(res.val().data));
        });

        // Connecting
        peer.on('connect', () => {
          // The connection is established, so disconnect from firebase
          this.setState({connected: true})
          database.goOffline();
        });

        // Data
        peer.on('data', (data) => {
          // got a data channel message
          if(data.toString() === 'controller'){
            this.setState({controller: true})
          }
          if(data.toString() === 'startGame'){
            this.setState({gameStarted: true})
          }
        });

        // Host disconnect
        peer.on('close', () => {
          // Update UI
          this.setState({
            gameStarted: false,
            connected: false,
            error: 'Disconnected from host',
            code: ''
          });

          // Reconnect to firebase
          database.goOnline();

          // Remove room
          database.ref('/rooms/'+code).remove();
          // TODO: Allow another host to join and continue game?
        });
      }
    })
  }

  render() {
    if(this.state.connected){
      if(this.state.gameStarted){
        if(this.state.controller){
          return (
            <Controller 
              jumpButton={this.sendInputFunction('jumpButton')}
              />
          )
        } else {
          return (
            // This is the mode where keyboard is used for controll and
            // game is displayed on the device
            <div />
          )
        }
      } else {
        return (
          <Checkbox
            label="Ready"
            onCheck={(_, checked) => {
              const setReady = this.sendInputFunction('ready');
              setReady(checked);
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
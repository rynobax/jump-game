import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as firebase from 'firebase';
import SimplePeer from 'simple-peer';
import DisplayGame from '../game/DisplayGame';
import LobbyList from '../lobby/LobbyList';

class Player extends Component {
  constructor() {
    super();
    this.state = {
      code: '',
      name: '',
      connected: false,
      gameStarted: false,
      error: '',
      database: firebase.database(),
      host: null,
      players: []
    }

    this.peer = null;

    this.broadcast = (obj) => {
      this.peer.send(JSON.stringify(obj));
    }

    this.sendReady = (ready) => {
      this.broadcast({
        type: 'ready',
        ready: ready
      });
    }

    this.handleData = (data) => {
        switch(data.type){
          case 'startGame':
            this.setState({gameStarted: true});
            break;
          case 'players':
            this.setState({players: data.players});
            break;
          default:
            throw Error('Unknown input ', data.type);
        }
        return;
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
        // Store reference to peer
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
          this.setState({connected: true})
          
          // The connection is established, so disconnect from firebase
          database.goOffline();
          
          // connect event is broken in chrome tabs or something, so this works around it for host
          // https://github.com/feross/simple-peer/issues/178
          setTimeout(() => {
            this.broadcast({
              type: 'connected'
            });
          }, 1000);
        });

        // Data
        peer.on('data', (data) => {
          // got a data channel message
          this.handleData(JSON.parse(data));
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
        return <DisplayGame host={this.peer} />
      } else {
        return <LobbyList players={this.state.players} checkFunction={this.sendReady} />
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

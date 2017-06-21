import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import CircularProgress from 'material-ui/CircularProgress';
import LobbyList from './LobbyList';
import * as firebase from 'firebase';

class Host extends Component {
  constructor(){
    super();
    this.state = {
      players: []
    }
  }

  componentDidMount(){
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
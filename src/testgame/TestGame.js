import React, { Component } from 'react';
import HostGame from '../host/HostGame';
import { OnInputChange, DefaultInput } from '../game/Input';

/*
  This is used so I can test the game without going through the menus
*/

class TestGame extends Component {
  constructor(props){
    super(props);
    const players = {};
    this.hostName = 'Ryan';
    players[this.hostName] = {
      host: true,
      ready: false,
      input: DefaultInput(),
      // Peer object with blank methods so I don't have to
      // filter when I iterate over players
      peer: {
        send: () => {}
      }
    }

    this.state = {
      players: players
    }

    this.copyPlayers = () => Object.assign({}, this.state.players);

    this.getPlayersForGame = () => {
      // Don't send peer info
      const players = {};
      for(const playerName in this.state.players) {
        players[playerName] = {
          input: this.state.players[playerName].input
        }
      }
      return players;
    }

    // Input from players
    this.handleInput = (playerName, input) => {
      const playersCopy = this.copyPlayers();
      for (const key in input) {
        playersCopy[playerName].input[key] = input[key];
      }
      this.setState({players: playersCopy});
    }

    // Input from host
    OnInputChange((input) => {
      this.handleInput(this.hostName, input);
    });
  }

  render() {
    return <HostGame players={this.getPlayersForGame()} broadcast={() => {}}/>
  }
}

export default TestGame;
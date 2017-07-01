import React, { Component } from 'react';
import { serializeState } from '../game/State';
import { createGame } from '../game/Game';


class HostGame extends Component {
  constructor(props){
    super(props);
    const {players, broadcast} = props;
    console.log('players: ', players);

    const onUpdateCb = (game) => {
      broadcast({
        type: 'gameUpdate',
        gameState: serializeState(game.world)
      });
    }

    const getPlayerInput = (playerName) => {
      return this.props.players[playerName].input;
    }

    createGame(players, onUpdateCb, null, getPlayerInput);
  }

  render() {
    return <div/>
  }
}

export default HostGame;
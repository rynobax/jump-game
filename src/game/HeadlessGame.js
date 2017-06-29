import React, { Component } from 'react';
import { createGame } from './Game';
import { broadcastState } from './State';

class DisplayGame extends Component {
  constructor(props){
    super(props);
    const players = props.players;

    const onUpdateCb = (game) => {
      broadcastState(game.world, players);
    }

    createGame({onUpdateCb: onUpdateCb, headless: true});
  }

  render() {
    return <h2>Keep this window visible or the game will freeze!</h2>
  }
}

export default DisplayGame;
import React, { Component } from 'react';
import { createGame } from './Game';
import { serializeState } from './State';

class DisplayGame extends Component {
  constructor(props){
    super(props);
    const players = props.players;

    const onUpdateCb = (game) => {
      const gameState = serializeState(game.world);
      players.forEach(({peer}) => {
        peer.send(JSON.stringify(gameState));
      });
    }
    createGame({onUpdateCb: onUpdateCb, headless: true});
  }

  render() {
    return <h2>Keep this window visible or the game will freeze!</h2>
  }
}

export default DisplayGame;
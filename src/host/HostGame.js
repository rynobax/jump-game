import { Component } from 'react';
import { serializeState } from '../game/State';
import { createGame, gameDiv } from '../game/Game';


class HostGame extends Component {
  componentDidMount(){
    const {players, broadcast} = this.props;

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
    return gameDiv();
  }
}

export default HostGame;
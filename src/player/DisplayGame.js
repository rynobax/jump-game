import React, { Component } from 'react';
import { createGame } from '../game/Game';

class DisplayGame extends Component {
  constructor(props){
    super(props);
    
    this.game = createGame(null, null, [
      'create',
      'update'
    ]);

    this.sprites = [];
  }

  componentWillReceiveProps(nextProps){
    const {gameState} = nextProps;
    this.sprites.forEach((sprite) => {
      sprite.destroy();
    });
    const spritesData = gameState.sprites;
    spritesData.forEach(({x, y, key, frame, scale}) => {
      const sprite = this.game.add.sprite(x, y, key, frame);
      sprite.scale.setTo(scale.x, scale.y);
      this.sprites.push(sprite);
    });
    return true;
  }

  render() {
    return <div id={'game'}/>
  }
}

export default DisplayGame;
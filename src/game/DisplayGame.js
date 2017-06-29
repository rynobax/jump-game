import React, { Component } from 'react';
import { createGame } from './Game';

class DisplayGame extends Component {
  constructor(props){
    super(props);
    const {host} = props;
    
    const game = createGame({ignore: [
      'create',
      'update'
    ]});
    window.gameObj = game;

    let sprites = [];

    host.on('data', (data) => {
      sprites.forEach((sprite) => {
        sprite.destroy();
      });
      const spritesData = JSON.parse(data);
      spritesData.forEach(({x, y, key, frame, scale}) => {
        const sprite = game.add.sprite(x, y, key, frame)
        sprite.scale.setTo(scale.x, scale.y);
        sprites.push(sprite);
      });
    });
  }

  render() {
    return <div id={'game'}/>
  }
}

export default DisplayGame;
import { Component } from 'react';
import { createGame, gameDiv } from '../game/Game';

class DisplayGame extends Component {
  componentDidMount(){
    this.game = createGame(null, null, [
      'create',
      'update'
    ]);

    this.objects = [];
  }

  componentWillReceiveProps(nextProps){
    const {gameState} = nextProps;
    this.objects.forEach((obj) => {
      obj.destroy();
    });
    const spritesData = gameState.sprites;
    spritesData.forEach(({x, y, key, frame, scale}) => {
      const sprite = this.game.add.sprite(x, y, key, frame);
      sprite.scale.setTo(scale.x, scale.y);
      this.objects.push(sprite);
    });
    const textData = gameState.texts;
    textData.forEach(({x, y, text, style}) => {
      const textObj = this.game.add.text(x, y, text, style);
      this.objects.push(textObj);
    });
    return true;
  }

  render() {
    return gameDiv();
  }
}

export default DisplayGame;
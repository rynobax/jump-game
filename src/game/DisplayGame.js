import React, { Component } from 'react';
import 'pixi.js';
import 'p2';
import Phaser from 'phaser';
import { sharedPreload } from './SharedGame';
import { recieveState } from './State';

const runGame = (host) => {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
  window.gameObj = game;

  function preload() {
    sharedPreload(game);
  }

  let sprites = [];
  host.on('data', (data) => {
    sprites.forEach((sprite) => {
      sprite.destroy();
    });
    const spritesData = JSON.parse(data);
    spritesData.forEach(({x, y, key, frame}) => {
      sprites.push(game.add.sprite(x, y, key, frame));
    });
  })

  function create() {
    
  }

  function update() {
  }

}

class DisplayGame extends Component {
  constructor(props){
    super(props);
    const {host} = props;
    runGame(host);
  }

  render() {
    return <div id={'game'}/>
  }
}

export default DisplayGame;
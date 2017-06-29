/* eslint-disable */
import React, { Component } from 'react';
import { createGame } from './Game';
import { serializeState } from './State';
import work from 'webworkify-webpack'

class DisplayGame extends Component {
  constructor(props){
    super(props);
    const players = props.players;

    var worker = work(require.resolve("./Game.js"));
    //var worker = new MyWorker();
    worker.onmessage = (msg) => {
      console.log('msg: ', msg.data);
    }
  }

  render() {
    return <h2>Keep this window visible or the game will freeze!</h2>
  }
}

export default DisplayGame;
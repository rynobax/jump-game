import React, { Component } from 'react';
import './App.css';
import Host from './host/Host';
import Player from './player/Player';

class App extends Component {
  constructor(){
    super();
    this.state = {
      role: 'visitor'
    }
  }

  render() {
    if(this.state.role === 'host') {
      return (
        <Host/>
      )
    } else if (this.state.role === 'player') {
      return (
        <Player/>
      )
    } else {
      return (
        <div className="App">
          <div className="App-header">
            <h2>Jump Game</h2>
          </div>
          <p className="App-intro">
            Need buttons for host and join which will adjust the state and display different content
          </p>
        </div>
      );
    } 
  }
}

export default App;

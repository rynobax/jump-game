import React, { Component } from 'react';

class Game extends Component {
  render() {
    return (
      <div>
        {
          this.props.players.map((e) => {
            return e.name + ' - ' + e.input.jumpButton
          })
        }
      </div>
    )
  }
}

export default Game;
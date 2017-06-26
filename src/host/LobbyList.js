import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';
import CheckBoxOutline from 'material-ui/svg-icons/toggle/check-box-outline-blank';

class LobbyList extends Component {
  render() {
    const {players, gameType} = this.props;
    let message = '';
      if (gameType === 'party') {
        message = <h3>To join, navigate to this page on your phone, and use the code to join!</h3>
      } else if(gameType === 'online') {
        message = <h3>To join, have your friends navigate to this page, and use the code to join!</h3>
      }
    return (
      <div>
        {message}
        Game will start when all players are ready
        <br />
        <List>
          {players.map(({name, input}, i) => {
            const ready = input.ready;
            return <ListItem primaryText={name} leftIcon={ready ? <CheckBox /> : <CheckBoxOutline />} key={i}/>
          })}
        </List>
      </div>
    )
  }
}

export default LobbyList;
import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';
import CheckBoxOutline from 'material-ui/svg-icons/toggle/check-box-outline-blank';

class LobbyList extends Component {
  render() {
    const {players} = this.props;
    console.log(this.props);
    if (players.length > 0) {
      return (
        <List>
          {players.map(({name, input}, i) => {
            const ready = input.ready;
            return <ListItem primaryText={name} leftIcon={ready ? <CheckBox /> : <CheckBoxOutline />} key={i}/>
          })}
        </List>
      )
    } else {
      return (
        <h3>To join, navigate to this page on the device you would like to use as your controller!</h3>
      );
    }
  }
}

export default LobbyList;
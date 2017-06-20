import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';
import CheckBoxOutline from 'material-ui/svg-icons/toggle/check-box-outline-blank';

class LobbyList extends Component {
  render() {
    return (
      <List>
        {this.props.players.map(({name, ready}, i) => {
          return <ListItem primaryText={name} leftIcon={ready ? <CheckBox /> : <CheckBoxOutline />} key={i}/>
        })}
      </List>
    )
  }
}

export default LobbyList;
import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';
import CheckBoxOutline from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import Checkbox from 'material-ui/Checkbox';

class LobbyList extends Component {
  render() {
    const {players} = this.props;
    return (
      <div>
        <h3>To join, have your friends navigate to this page, and use the code to join!</h3>
        Game will start when all players are ready
        <br />
        <List>
          {players.map(({name, ready}, i) => {
            return <ListItem primaryText={name} leftIcon={ready ? <CheckBox /> : <CheckBoxOutline />} key={i}/>
          })}
        </List>
        <Checkbox
            label="Ready"
            onCheck={(_, checked) => {
              this.props.checkFunction(checked);
            }}
          />
      </div>
    )
  }
}

export default LobbyList;
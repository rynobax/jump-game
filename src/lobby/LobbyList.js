import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';
import CheckBoxOutline from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import RaisedButton from 'material-ui/RaisedButton';

class LobbyList extends Component {
  constructor() {
    super();
    this.state = {
      ready: false
    }
  }

  render() {
    const {players} = this.props;
    let button = '';
    if(this.state.ready) {
      button = <RaisedButton label="Unready" secondary={true} onTouchTap={() => {
        this.props.checkFunction(false);
        this.setState({ready: false});
      }} />
    } else {
      button = <RaisedButton label="Ready" primary={true} onTouchTap={() => {
        this.props.checkFunction(true);
        this.setState({ready: true});
      }} />
    }
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
        {button}
      </div>
    )
  }
}

export default LobbyList;
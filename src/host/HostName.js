import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Host from './Host';

class LobbyList extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      submitted: false
    }
  }
  render() {
    if(!this.state.submitted){
      return (
        <div>
          <TextField
            floatingLabelText="Username"
            floatingLabelFixed={true}
            onChange={(_, v) => this.setState({name: v})}
          />
          <br/>
          <RaisedButton label="Host Game"
            style={{margin: 12}}
            onTouchTap={() => this.setState({submitted: true})}
            disabled={this.state.name.length === 0}/>
        </div>
      )
    } else {
      return <Host name={this.state.name} />
    }
  }
}

export default LobbyList;
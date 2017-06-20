import React, { Component } from 'react';
import './App.css';
import Host from './host/Host';
import Player from './player/Player';
import Guest from './guest/Guest';
import AppBar from 'material-ui/AppBar';

class App extends Component {
  constructor(){
    super();
    this.state = {
      role: 'host'
    }
  }

  getRoleContent = (role) => {
    if(this.state.role === 'host') {
      return <Host/>;
    } else if (this.state.role === 'player') {
      return <Player/>;
    } else {
      return <Guest 
        becomeHost={() => this.setState({role: 'host'})}
        becomePlayer={() => this.setState({role: 'player'})}
        />;
    } 
  }

  render() {
    return (
      <div>
        <AppBar
          title="Jump Game"
          titleStyle={{textAlign: "center"}}
          showMenuIconButton={false}
        />
        {this.getRoleContent(this.state.role)}
      </div>
    )
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';
import HostType from './host/HostType';
import Player from './player/Player';
//import Guest from './guest/Guest';
import AppBar from 'material-ui/AppBar';
import Peer from 'simple-peer';
import HeadlessGame from './game/HeadlessGame'
import HostGame from './game/HostGame'

class App extends Component {
  constructor(){
    super();
    if(Peer.WEBRTC_SUPPORT){ // test for webrtc support
      this.state = {
        role: 'visitor'
      };
    } else {
      this.state = {
        role: 'unsupported'
      };
    }
  }

  getRoleContent = (role) => {
    if(this.state.role === 'host') {
      return <HostType/>;
    } else if (this.state.role === 'player') {
      return <Player/>;
    } else if (this.state.role === 'unsupported') {
      return (
        <div>
          Your browser does not support WebRTC Data Channel
        </div>
      );
    } else {
      return <HeadlessGame players={[]}/>
      //return <HostGame players={[]}/>
      /*return <Guest 
        becomeHost={() => this.setState({role: 'host'})}
        becomePlayer={() => this.setState({role: 'player'})}
        />;*/
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

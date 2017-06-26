import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Host from './Host';

const buttonDivStyle = {
  display: "flex"
}

const buttonStyle = {
  margin: 25,
  flex: 1
};

class HostType extends Component {
  constructor(){
    super();
    this.state = {
      gameType: null
    }
  }

  render() {
    if (this.state.gameType === null) {
      return (
        <div style={buttonDivStyle}>
          <RaisedButton 
            label="Host Party Game"
            primary={true} 
            style={buttonStyle}
            onTouchTap={() => this.setState({gameType: 'party'})}
            />
          <RaisedButton 
            label="Host Online Game"
            secondary={true}
            style={buttonStyle}
            onTouchTap={() => this.setState({gameType: 'online'})}
            />
        </div>
      );
    } else {
      return (<Host gameType={this.state.gameType}/>);
    }
  }
}

export default HostType;
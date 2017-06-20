import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

class Controller extends Component {
  render() {
    return (
      <div>
        <RaisedButton 
          label="Press Me"
          fullWidth={true}
          style={{height: 150}}
          onMouseDown={() => {
            this.props.dataConnection.send('jumpButtonDown')
          }}
          onMouseUp={() => {
            this.props.dataConnection.send('jumpButtonUp')
          }}
        />
      </div>
    );
  }
}

export default Controller;
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
          onClick={() => {
            console.log('dataConnection: ', this.props.dataConnection);
            this.props.dataConnection.send('hello')
          }}
        />
      </div>
    );
  }
}

export default Controller;
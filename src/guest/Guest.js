import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const buttonDivStyle = {
  display: "flex"
}

const buttonStyle = {
  margin: 25,
  flex: 1
};

const Guest = (props) => {
  return (
    <div style={buttonDivStyle}>
      <RaisedButton 
        label="Host"
        primary={true} 
        style={buttonStyle}
        onTouchTap={props.becomeHost}
        />
      <RaisedButton 
        label="Join"
        secondary={true}
        style={buttonStyle}
        onTouchTap={props.becomePlayer}
        />
    </div>
  );
}

export default Guest;
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as firebase from "firebase";

firebase.initializeApp({
  apiKey: "AIzaSyC--x3JTzuP0ezakeUJKLtsiu--iyW1xrA",
  authDomain: "jump-game.firebaseapp.com",
  databaseURL: "https://jump-game.firebaseio.com",
  projectId: "jump-game",
  storageBucket: "jump-game.appspot.com",
  messagingSenderId: "1088406848683"
});

injectTapEventPlugin();

const ThemedApp = () => {
  return (
    <MuiThemeProvider  muiTheme={getMuiTheme(lightBaseTheme)}>
      <App />
    </MuiThemeProvider>
  );
};

ReactDOM.render(<ThemedApp/>, document.getElementById('root'));
registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

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

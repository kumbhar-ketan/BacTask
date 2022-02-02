import React from 'react';
import { Provider } from 'react-redux';
import Main from './src/screens/Main';
import store from './src/store';

const App = () => {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
};

export default App;

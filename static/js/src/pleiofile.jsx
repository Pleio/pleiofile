import FileBrowser from './views/FileBrowser';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import React from 'react';
import 'babel-polyfill';

const loggerMiddleware = createLogger();
let store = createStore(rootReducer, {}, applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
));

var ReactDOM = require('react-dom');
ReactDOM.render(
    <Provider store={store}>
        <FileBrowser homeGuid={_appData['containerGuid']} />
    </Provider>,
    document.getElementById('pleiofile')
);

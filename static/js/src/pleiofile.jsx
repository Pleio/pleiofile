import FileBrowser from './views/FileBrowser';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import React from 'react';
import 'babel-polyfill';

var ReactDOM = require('react-dom');

$('.pleiofile').each(function() {
    const loggerMiddleware = createLogger();
    let store = createStore(rootReducer, {}, applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    ));

    ReactDOM.render(
        <Provider store={store}>
            <FileBrowser containerGuid={$(this).data("containerguid")} homeGuid={$(this).data("homeguid")} />
        </Provider>, this)
})
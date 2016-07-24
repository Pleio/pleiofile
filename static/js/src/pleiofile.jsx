import FileBrowser from './views/FileBrowser';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import pleioFile from './reducers';
import React from 'react';

let store = createStore(pleioFile);

var ReactDOM = require('react-dom');
ReactDOM.render(
    <Provider store={store}>
        <FileBrowser homeGuid={_appData['containerGuid']} />
    </Provider>,
    document.getElementById('pleiofile')
);

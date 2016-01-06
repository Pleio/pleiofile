import FileBrowser from './views/FileBrowser';
import React from 'react';

var ReactDOM = require('react-dom');
ReactDOM.render(
    <FileBrowser homeGuid={_appData['containerGuid']} />,
    document.getElementById('pleiobox')
);

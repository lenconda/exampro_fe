import React from 'react';
import dva from './patches/dva';
import { createBrowserHistory } from 'history';
import App from './App';
import AppModel from './models/app';
import './index.less';

const history = createBrowserHistory();
const app = dva({ history });
app.router(() => <App />);
app.model(AppModel);
app.start(document.getElementById('root'));

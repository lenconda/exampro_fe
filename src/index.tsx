import dva from './patches/dva';
import App from './App';
import AppModel from './models/app';
import { createBrowserHistory } from 'history';
import React from 'react';
import './index.less';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/image/lib/plugin.css';
import '@draft-js-plugins/focus/lib/plugin.css';

const history = createBrowserHistory();
const app = dva({ history });
app.router(() => <App />);
app.model(AppModel);
app.start(document.getElementById('root'));

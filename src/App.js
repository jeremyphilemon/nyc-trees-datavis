import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import './App.css';

import Home from './components/home.js';
import Zone from './components/zone.js';
import BlackHole from './components/blackhole.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/zipcode/:zipcode" component={Zone} />
            <Route path="*" component={BlackHole} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

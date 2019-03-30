import React, { Component } from 'react';
import 'bulma/css/bulma.css';
import './../App.css';

class BlackHole extends Component {

  render() {
    return (
      <div className="is-unselectable">
        <section class="hero is-large has-text-centered">
          <div class="hero-body">
            <div class="container">
              <h1 class="title blackhole cereal">404</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default BlackHole;
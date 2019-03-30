import React, { Component } from 'react';
import 'bulma/css/bulma.css';
import './../App.css';

class Zone extends Component {
	constructor(props) {
    super(props);
    this.state = {
      datapoint: this.props.location.state.datapoint,
    };
  	}

  render() {
    return (
      <div className="is-unselectable">
      <section class="hero">
		  <div class="hero-body">
		    <div class="container">
		      <h1 class="title">
		        { this.state.datapoint.properties.ZIPCODE }
		      </h1>
		      <h2 class="subtitle">
		        { this.state.datapoint.properties.COUNTY }, { this.state.datapoint.properties.PO_NAME }
		      </h2>
		    </div>
		  </div>
		</section>
      </div>
    );
  }
}

export default Zone;
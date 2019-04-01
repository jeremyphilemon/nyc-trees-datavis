import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {geoMercator, geoPath, geoAlbers, geoAlbersUsa, geoIdentity} from 'd3-geo';
import {select} from 'd3-selection';
import {feature} from 'topojson-client';
import {color} from 'd3-color';
import * as d3 from 'd3';

import 'bulma/css/bulma.css';
import './../App.css';

import Bubble from './bubble.js';

class Zone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datapoint: this.props.location.state.datapoint,
      color: this.props.location.state.color,
      width: 30,
      height: 30,
    };
  }

  componentDidMount() {
    this.createMap();
  }

  projectionAlbers(datapoint) {
    return geoAlbers().fitSize([this.state.width, this.state.height], datapoint);
  }

  createMap() {
    const node = this.node;
    const path = geoPath().projection(this.projectionAlbers(this.state.datapoint));
    select(node)
        .selectAll('path')
        .data([this.state.datapoint])
        .enter().append('path')
        .attr('d', path)
        .style('fill', this.state.color)
        .style('stroke', '#424242')
        .style('stroke-width', 0.1)
        .style('cursor', 'pointer');
  }

  render() {
    return (
      <div className="is-unselectable">
        <section className="hero">
          <Link to='/'>Back</Link>
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                { this.state.datapoint.properties.ZIPCODE ? this.state.datapoint.properties.ZIPCODE : '' }
              </h1>
              <h2 className="subtitle">
                { this.state.datapoint.properties.COUNTY }, { this.state.datapoint.properties.PO_NAME }
              </h2>
            </div>
          </div>
        </section>
        <div className="columns">
          <div className="column">
            <svg className="svg-zone" ref={(node) => this.node = node} preserveAspectRatio="xMidYMin" viewBox="0 0 100 100"/>
          </div>
          <div className="column">
            <Bubble zipcode={this.state.datapoint.properties.ZIPCODE} />
          </div>
        </div>

      </div>
    );
  }
}

export default Zone;

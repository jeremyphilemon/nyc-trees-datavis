import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import * as Icon from 'react-feather';
import {geoPath, geoAlbers} from 'd3-geo';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {select} from 'd3-selection';
import * as d3 from 'd3';

import 'bulma/css/bulma.css';
import './../App.css';

import Bubble from './bubble.js';

class Zone extends Component {
  constructor(props) {
    super(props);
    if (this.props.location.state===undefined) this.state = {redirect: true};
    else {
      this.state = {
        datapoint: this.props.location.state.datapoint,
        color: this.props.location.state.color,
        width: 250,
        height: 250,
      };
    }
  }

  componentDidMount() {
    this.createMap(()=>{
      d3.csv('/trees.csv', (d)=>{
        if (d.Postcode===this.state.datapoint.properties.ZIPCODE) {
          return {
            species: d.Species,
            diameter: parseInt(d.Diameter),
            status: d.Status,
            health: d.Health,
          };
        }
      }).then((response) => {
        this.setState({data: response}, ()=>{

        });
      });
    });
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
        .style('cursor', 'pointer');
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={{
        pathname: `/`,
        state: {redirect: true, zipcode: this.props.match.params.zipcode},
      }}/>;
    }

    return (
      <div className="is-unselectable">
        <nav className="level is-mobile">
          <div class="level-item has-text-centered">
            <div>
              <Link to='/'>
                <p className="heading">Back</p>
                <p className="title"><Icon.ArrowUp /></p>
              </Link>
            </div>
          </div>
        </nav>
        <div className="columns">
          <div className="column zone-meta">
            <div className="zone-boundary">
              <svg ref={(node) => this.node = node} preserveAspectRatio="xMidYMin" height="250" width="250"/>
              <h1 className="title is-circular">
                { this.state.datapoint.properties.COUNTY }, { this.state.datapoint.properties.PO_NAME }
              </h1>
              <h2 className="subtitle is-circular">
                { this.state.datapoint.properties.ZIPCODE ? this.state.datapoint.properties.ZIPCODE : '' }
              </h2>
            </div>
            <div className="zone-details">
              <nav className="level is-mobile">
                <div class="level-item has-text-centered is-pulled-right">
                  <div>
                    <p className="heading">Tree Population</p>
                    <p className="title">{this.props.location.state.population}</p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Human Population</p>
                    <p className="title">{this.state.datapoint.properties.POPULATION}</p>
                  </div>
                </div>
              </nav>
              <nav className="level is-mobile">
                <div class="level-item has-text-centered">
                  <div>
                    <Link to='/'>
                      <p className="heading">That is about</p>
                      <p className="title">{Math.round((this.props.location.state.population/this.state.datapoint.properties.POPULATION)*100)/100} trees</p>
                    </Link>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">For every</p>
                    <p className="title"><Icon.User size={40}/></p>
                  </div>
                </div>
              </nav>
            </div>
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

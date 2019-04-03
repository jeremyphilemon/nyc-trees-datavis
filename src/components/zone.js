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
import Pie from './pie.js';

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
        topTrees: [],
        health: [0, 0, 0],
        visibile: false,
      };
    }
  }

  contextualise(data) {
    const treeCount = {};
    let good=0; let fair=0; let poor=0;
    for (let i=0, len=data.length; i<len; i++) {
      if (data[i].health=='Good') good+=1;
      else if (data[i].health=='Fair') fair+=1;
      else poor+=1;
      if (!(data[i].species in treeCount)) treeCount[data[i].species]=1;
      else treeCount[data[i].species]+=1;
    }
    const trees = Object.keys(treeCount).map(function(key) {
      return [key, treeCount[key]];
    });
    trees.sort(function(first, second) {
      return second[1] - first[1];
    });
    this.setState({
      topTrees: trees.slice(0, 5),
      speciesCount: Object.keys(treeCount).length,
      health: [good, fair, poor],
      treeCount: treeCount,
    });
  }

  fetchTrees() {
    d3.csv('/trees.csv', (d)=>{
      if (d.POSTCODE===this.state.datapoint.properties.ZIPCODE) {
        return {
          species: d.SPECIES,
          diameter: parseInt(d.DIAMETER),
          status: d.STATUS,
          health: d.HEALTH,
        };
      }
    }).then((response)=>{
      this.contextualise(response);
    });
  }

  componentDidMount() {
    this.createMap();
    setTimeout(function() {
      this.fetchTrees();
      this.setState({
        visible: true,
      });
    }.bind(this), 1500);
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
          <div className="level-item has-text-centered">
            <div>
              <Link to='/'>
                <p className="heading">Back</p>
                <p className="title"><Icon.ArrowUp /></p>
              </Link>
            </div>
          </div>
        </nav>
        <div className="columns">
          <div className="column">
            <div className="zone-meta">
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
                <nav className="level is-mobile meta-level">
                  <div className="level-item">
                    <div>
                      <p className="heading">Tree Population</p>
                      <p className="title">{this.props.location.state.population}</p>
                    </div>
                  </div>
                  <div className="level-item">
                    <div>
                      <p className="heading">Human Population</p>
                      <p className="title">{this.state.datapoint.properties.POPULATION}</p>
                    </div>
                  </div>
                </nav>
                <nav className="level is-mobile">
                  <div className="level-item">
                    <div className="tree-ratio">
                      <p className="heading">That is about</p>
                      <p className="title">{Math.round((this.props.location.state.population/this.state.datapoint.properties.POPULATION)*100)/100} trees</p>
                    </div>
                  </div>
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">For every human</p>
                      <p className="title"><Icon.User size={40}/></p>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
            <div className="more-meta">
              <div className="top-trees">
                <h1 className="title is-circular">
                  There are {this.state.speciesCount} different species
                </h1>
                <h2 className="subtitle is-circular species-subtitle">
                  Most abundant in this area
                </h2>
                <div className="fade-in">
                  {
                    this.state.topTrees.map((tree, id)=>{
                      return (
                        <p class="top-species-name" key={id}>{tree[0]}</p>
                      );
                    })
                  }
                </div>
              </div>
              <div className="health-trees">
                <h1 className="title is-circular has-text-centered">
                  Health Status
                </h1>
                <div className="health-trees">
                  <Pie data={this.state.health}/>
                </div>
              </div>
            </div>
          </div>
          <div className="column">
            <Bubble zipcode={this.state.datapoint.properties.ZIPCODE} data={this.state.treeCount}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Zone;

import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import { geoMercator, geoPath, geoAlbers, geoAlbersUsa } from 'd3-geo';
import { select } from 'd3-selection';
import { feature } from "topojson-client"
import { color } from "d3-color"
import * as d3 from "d3";

import 'bulma/css/bulma.css';
import './../App.css';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapData: [],
      lookup: {},
      datapoint: '',
      stroke: 0,
    };
    this.createMap = this.createMap.bind(this);
    this.projectionAlbers = this.projectionAlbers.bind(this);
    this.showZip = this.showZip.bind(this);
  }

  componentDidMount() {
    var lookup = {};
    d3.csv("/treecount_zipcode.csv").then(response => {
      response.forEach((d) => {
        lookup[d.Postcode] = +d.Count;
      });
    });
    this.setState({ lookup: lookup })
    this.createMap();
  }

  projectionAlbers() {
    return geoAlbers().center([0, 40.7])
       .rotate([74, 0])
       .translate([225, 125])
       .scale(30000);
  }

  generateColor(datapoint) {
    if(this.state.lookup[datapoint.properties.ZIPCODE]===undefined) return 'white';
    const opacity = this.state.lookup[datapoint.properties.ZIPCODE]/20000
    return color(`rgba(17, 122, 101, ${opacity})`)
  }

  showZip(datapoint) {
    if(datapoint===0) this.setState({"datapoint": ''})
    this.setState({"datapoint": datapoint})
  }

  handleClick(datapoint) {
     this.setState({redirect: true});
  }

  createMap() {
    const node = this.node;
    fetch("/newyork.json").then(response => {
      response.json().then(mapData => {
        this.setState({
          mapData: feature(mapData, mapData.objects.ZIP_CODE_040114).features,
        });
        select(node)
          .selectAll("path")
          .data(feature(mapData, mapData.objects.ZIP_CODE_040114).features)
          .enter().append('path')
          .attr("d", geoPath().projection(this.projectionAlbers()))
          .style('fill', (datapoint) => {return this.generateColor(datapoint)})
          .style('stroke', this.state.strokecolor ? 'black' : 'white')
          .style('stroke-width', 0.25)
          .style('cursor', 'pointer')
          .on("mouseover", (datapoint) => {this.showZip(datapoint)})
          .on("mouseout", (datapoint) => {this.showZip(0)})
          .on("click", (datapoint) => {this.handleClick(datapoint)})
      })
    })
  }

  render() {
    if(this.state.redirect) {
      return <Redirect push to={{
        pathname: `/zipcode/${this.state.datapoint.properties.ZIPCODE}`,
        state: {datapoint: this.state.datapoint}
      }}/>
    }

    return (
      <div className="site-content is-unselectable">
        <section className="hero">
          <div className="hero-body">
            <div className="container">
              <h1 className="title is-circular">
                Trees in New York City 
                | {this.state.datapoint ? +this.state.datapoint.properties.ZIPCODE : "ZIP"}
              </h1>
            </div>
          </div>
        </section>
        <svg ref={node => this.node = node} preserveAspectRatio="xMidYMin" viewBox="0 0 500 250"/>
      </div>
    );
  }
}

export default Home;
import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import {geoPath, geoAlbers} from 'd3-geo';
import {select} from 'd3-selection';
import {feature} from 'topojson-client';
import * as d3 from 'd3';

import 'bulma/css/bulma.css';
import './../App.css';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapData: [],
      lookup: {},
      width: 960,
      height: 600,
      datapoint: '',
      loaded: false,
    };
    this.createMap = this.createMap.bind(this);
    this.projectionAlbers = this.projectionAlbers.bind(this);
    this.showZip = this.showZip.bind(this);
  }

  componentDidMount() {
    const lookup = {};
    d3.csv('/treecount_zipcode.csv').then((response) => {
      response.forEach((d) => {
        lookup[d.Postcode] = +d.Count;
      });
    });
    this.setState({lookup: lookup});
    this.fetchMap();
  }

  projectionAlbers() {
    return geoAlbers().center([0, 40.305])
        .rotate([74, 0])
        .translate([this.state.width/4, this.state.height/1.85])
        .scale(30000);
  }

  generateColor(datapoint) {
    if (this.state.lookup[datapoint.properties.ZIPCODE]===undefined) return 'white';
    const opacity = this.state.lookup[datapoint.properties.ZIPCODE]/15000;
    return d3.interpolateGreens(opacity);
  }

  showZip(datapoint) {
    if (datapoint===0) this.setState({datapoint: '', trees_count: ''});
    else if (!this.state.lookup[datapoint.properties.ZIPCODE]) {
      this.setState({datapoint: datapoint, trees_count: '0'});
    } else {
      this.setState({
        datapoint: datapoint,
        trees_count: this.state.lookup[datapoint.properties.ZIPCODE],
      });
    }
  }

  handleClick(datapoint) {
    this.setState({redirect: true, color: this.generateColor(datapoint)});
  }

  createLegend() {
    const svg = this.svg;
    const color_domain = [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000];
    const ext_color_domain = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000];
    const legend_labels = ['<2000', '2000+', '4000+', '6000+', '8000+', '10000+', '12000+', '14000+', '16000+', '18000+'];
    const ls_w = 20; const ls_h = 20;
    const legend = select(svg)
        .selectAll('legend')
        .data(ext_color_domain)
        .enter().append('g')
        .attr('class', 'legend');
    legend.append('rect')
        .attr('x', 20)
        .attr('y', function(d, i) {
          return 200 - (i*ls_h) - (2*ls_h);
        })
        .attr('width', ls_w)
        .attr('height', ls_h)
        .style('fill', function(d, i) {
          return d3.interpolateGreens(d/18000);
        });
    legend.append('text')
        .attr('x', 45)
        .attr('y', function(d, i) {
          return 200 - (i*ls_h) - ls_h - 7.5;
        })
        .text(function(d, i) {
          return legend_labels[i];
        })
        .attr('class', 'is-circular')
        .style('fill', '#424242')
        .style('font-size', '0.5rem')
        .style('font-weight', '600');
  }

  fetchMap() {
    fetch('/newyork.json').then((response) => {
      response.json().then((mapData) => {
        const features = feature(mapData, mapData.objects.ZIP_CODE).features;
        this.setState({
          mapData: features,
        }, ()=>{
          this.setState({
            loaded: true,
          }, ()=>{
            this.createMap();
            this.createLegend();
          });
        });
      });
    });
  }

  createMap() {
    const tooltip = select('body')
        .append('div')
        .attr('class', 'is-circular')
        .text('tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('color', 'white')
        .style('padding', '8px')
        .style('background-color', 'rgba(0, 0, 0, 0.75)')
        .style('border-radius', '6px')
        .style('font-weight', '600')
        .style('text-transform', 'capitalize');
    select(this.svg)
        .selectAll('path')
        .data(this.state.mapData)
        .enter().append('path')
        .attr('d', geoPath().projection(this.projectionAlbers()))
        .attr('class', 'zone')
        .style('stroke', 'white')
        .style('stroke-width', 0.25)
        .style('cursor', 'pointer')
        .style('fill', (datapoint) => {
          return this.generateColor(datapoint);
        })
        .on('mouseover', (datapoint) => {
          this.showZip(datapoint);
          tooltip.text(this.state.datapoint.properties.ZIPCODE);
          tooltip.style('visibility', 'visible');
        })
        .on('mousemove', (datapoint)=> {
          return tooltip.style('top', (d3.event.pageY-10)+'px').style('left', (d3.event.pageX+10)+'px');
        })
        .on('mouseout', (datapoint) => {
          this.showZip(0);
          return tooltip.style('visibility', 'hidden');
        })
        .on('click', (datapoint) => {
          this.handleClick(datapoint, );
          return tooltip.style('visibility', 'hidden');
        });
  }

  render() {
    if (this.props.location.state!==undefined && this.props.location.state.redirect) {
      return <Redirect push to={{
        pathname: `/zipcode/${this.props.location.state.zipcode}`,
        state: {datapoint: this.state.datapoint, population: this.state.trees_count},
      }}/>;
    }

    if (this.state.redirect) {
      return <Redirect push to={{
        pathname: `/zipcode/${this.state.datapoint.properties.ZIPCODE}`,
        state: {datapoint: this.state.datapoint, color: this.state.color, population: this.state.trees_count},
      }}/>;
    }

    if (!this.state.loaded) {
      return (
        <div className="site-content">
          <section className="hero">
            <div className="hero-body">
              <div className="container">
                <h1 className="title is-circular">
                Trees in New York City <br/>
                </h1>
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (this.state.loaded) {
      return (
        <div className="site-content">
          <section className="hero">
            <div className="hero-body">
              <div className="container">
                <h1 className="title is-circular">
                Trees in New York City <br/>
                </h1>
              </div>
            </div>
          </section>
          <svg className="add-fade" ref={(svg) => this.svg = svg} preserveAspectRatio="xMidYMin" viewBox="0 0 500 250"/>
        </div>
      );
    }
  }
}

export default Home;

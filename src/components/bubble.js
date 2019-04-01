import React, {Component} from 'react';
import {select} from 'd3-selection';
import * as d3 from 'd3';

import 'bulma/css/bulma.css';
import './../App.css';

class Bubble extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zipcode: this.props.zipcode,
      width: 500,
      height: 500,
    };
    this.createBubble = this.createBubble.bind(this);
  }

  componentDidMount() {
    d3.csv('/treetypes_zipcode.csv', (d)=>{
      if (d.Postcode===this.props.zipcode) {
        return {
          species: d.Species,
          count: d.Count,
        };
      }
    }).then((response) => {
      this.setState({data: response}, ()=>{
        this.createBubble();
      });
    });
  }

  createBubble() {
    const svg = this.svg;
    const radiusScale = d3.scaleSqrt().domain([0, 435]).range([1, 50]);
    const simulation = d3.forceSimulation().force('x', d3.forceX(0).strength(0.0000001))
        .force('y', d3.forceY(0).strength(0.0000001))
        .force('collide', d3.forceCollide((d)=>{
          return radiusScale(d.count)+0.5;
        }));
    const circles = select(svg).append('g').attr('transform', 'translate(250, 250)').selectAll('.tree').data(this.state.data).enter().append('circle').attr('class', 'tree').attr('r', (d)=>{
      return radiusScale(d.count);
    }).attr('fill', (d)=>{
      return d3.interpolateGreens(d.count/450);
    });
    simulation.nodes(this.state.data).on('tick', (d)=>{
      circles.attr('cx', (d)=>{
        return d.x;
      }).attr('cy', (d)=>{
        return d.y;
      });
    });
  }

  render() {
    return (
      <div className="is-unselectable">
        <svg ref={(svg) => this.svg = svg} preserveAspectRatio="xMidYMin" height="500" width="500"/>
      </div>
    );
  }
}

export default Bubble;

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
          count: parseInt(d.Count),
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
    const max = d3.max(this.state.data, (d)=>{
      return d.count;
    });
    const radiusScale = d3.scaleSqrt().domain([0, max]).range([10, 100]);
    const simulation = d3.forceSimulation().force('x', d3.forceX(0).strength(0.0001))
        .force('y', d3.forceY(0).strength(0.0009))
        .force('collide', d3.forceCollide((d)=>{
          return radiusScale(d.count)+3;
        }));
    const circle = select(svg).append('g').attr('transform', 'translate(500, 500)').selectAll('.tree').data(this.state.data).enter().append('circle').attr('class', 'tree').attr('r', (d)=>{
      return radiusScale(d.count);
    }).attr('fill', (d)=>{
      return d3.interpolateGreens(radiusScale(d.count)/100);
    })
        .style('cursor', 'pointer');
    const labels = select(svg).append('g').attr('transform', 'translate(500, 500)').selectAll(null).data(this.state.data).enter().append('text').text((d)=>d.count).style('fill', (d)=>{
      const contrast = 1-radiusScale(d.count)/100;
      if (contrast>=0.4 && contrast<0.6) return d3.interpolateGreens(0.8);
      return d3.interpolateGreens(contrast);
    }).attr('text-anchor', 'middle').attr('cursor', 'pointer').attr('dy', '.3em').attr('class', 'is-circular').attr('font-weight', '600').attr('font-size', (d)=>{
      const size = radiusScale(d.count);
      if (d.count>=999) return size-25;
      return size;
    });
    simulation.nodes(this.state.data).on('tick', (d)=>{
      circle.attr('cx', (d)=>{
        return d.x;
      }).attr('cy', (d)=>{
        return d.y;
      });
      labels.attr('x', (d)=>{
        return d.x;
      }).attr('y', (d)=>{
        return d.y;
      });
    });
    const tooltip = select('body')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('color', 'white')
        .style('padding', '8px')
        .style('background-color', 'rgba(0, 0, 0, 0.75)')
        .style('border-radius', '6px')
        .attr('class', 'is-circular')
        .style('font-weight', '600')
        .style('text-transform', 'capitalize')
        .text('tooltip');
    labels.on('mouseover', (d)=>{
      tooltip.text(d.species);
      tooltip.style('visibility', 'visible');
    })
        .on('mousemove', ()=>{
          return tooltip.style('top', (d3.event.pageY-10)+'px').style('left', (d3.event.pageX+10)+'px');
        })
        .on('mouseout', ()=>{
          return tooltip.style('visibility', 'hidden');
        });
    circle.on('mouseover', (d)=>{
      tooltip.text(d.species);
      tooltip.style('visibility', 'visible');
    })
        .on('mousemove', ()=>{
          return tooltip.style('top', (d3.event.pageY-10)+'px').style('left', (d3.event.pageX+10)+'px');
        })
        .on('mouseout', ()=>{
          return tooltip.style('visibility', 'hidden');
        });
  }

  render() {
    return (
      <div className="is-unselectable">
        <svg className="svg-bubble" ref={(svg) => this.svg = svg} preserveAspectRatio="xMidYMin" viewBox="0 0 1000 1000"/>
      </div>
    );
  }
}

export default Bubble;

import React, {Component} from 'react';
import 'bulma/css/bulma.css';
import './../App.css';
import * as d3 from 'd3';
import {select} from 'd3-selection';

class Pie extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data[0]!==this.props.data[0]) {
      this.setState({health: nextProps.health}, ()=>{
        this.createPie();
      });
    }
  }

  createPie() {
    const text = '';
    const width = 250;
    const height = 250;
    const thickness = 40;
    const duration = 750;
    const total = this.props.data[0]+this.props.data[1]+this.props.data[2];

    const data = [
      {name: 'Good', value: this.props.data[0], index: 0},
      {name: 'Fair', value: this.props.data[1], index: 1},
      {name: 'Bad', value: this.props.data[2], index: 2},
    ];

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal().range(['#65bc6f', '#ffd54f', '#ff7043']);

    const svg = select(this.svg)
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

    const arc = d3.arc()
        .innerRadius(radius - thickness)
        .outerRadius(radius);

    const pie = d3.pie()
        .value(function(d) {
          return d.value;
        })
        .sort(null);

    const path = g.selectAll('path')
        .data(pie(data))
        .enter()
        .append('g')
        .on('mouseover', function(d) {
          const g = d3.select(this)
              .style('cursor', 'pointer')
              .style('fill', ()=>{
                return color(d.index);
              })
              .append('g')
              .attr('class', 'text-group');

          g.append('text')
              .attr('class', 'name-text')
              .text(`${d.data.name}`)
              .attr('text-anchor', 'middle')
              .attr('dy', '-0.5em');

          g.append('text')
              .attr('class', 'value-text')
              .text(`${Math.round((d.data.value/total)*100)}%`)
              .attr('text-anchor', 'middle')
              .attr('dy', '.6em');
        })
        .on('mouseout', function(d) {
          d3.select(this)
              .select('.text-group').remove();
        })
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .on('mouseover', function(d) {
          d3.select(this)
              .style('cursor', 'pointer')
              .style('fill', '#e0e0e0');
        })
        .on('mouseout', function(d) {
          d3.select(this)
              .style('cursor', 'none')
              .style('fill', color(this._current));
        })
        .each(function(d, i) {
          this._current = i;
        });

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(text);
  }

  render() {
    return (
      <div className="is-unselectable">
        <svg ref={(svg) => this.svg = svg} preserveAspectRatio="xMidYMin" width="250" height="250"/>
      </div>
    );
  }
}

export default Pie;

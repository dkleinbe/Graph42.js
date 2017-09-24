/** @module GraphEditor */
'use strict';

var _ = require('lodash');
/**
Class to access Neo4j database
**/
export class GraphEditor {
	/**
	**/
	constructor(svg) {
		this._svg = svg; 
		
		var width = 1500, height = 500;
		this._forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

	}
	/**
	**/
	renderGraph(graph) {
		this._graph = graph;
		
		this._forceSim.nodes(graph.nodes);
      	this._forceSim.force("link", d3.forceLink().links(graph.links));
      	var svg = this._svg;


      	var link = svg.selectAll(".link")
        	.data(graph.links);

      	link.enter().append("line").attr("class", "link");

	    link.exit().remove();

      	var links = svg.selectAll(".link");

      	var node = svg.selectAll(".node")
        	.data(graph.nodes, d => { return d.title; });

      	node.attr("class", d => { return "node " + d.label + " update" });

      	node.enter()
	        .append("circle")
	        .attr("class", d => {
	          return "node " + d.label
	        })
	        .attr("r", 10)
	        .call(d3.drag()
	          .on("start", (d) => this.dragstarted(d))
	          .on("drag", (d) => this.dragged(d))
	          .on("end", (d) => this.dragended(d)))
	        .append("title")
	          .text(d => {
	            return d.title;
	        });

      	node.exit().remove();
      	// html title attribute
      	var nodes = svg.selectAll(".node");
      
      // force feed algo ticks
      	this._forceSim.on("tick", () => {
	        links.attr("x1", d => {
	          return d.source.x;
	        }).attr("y1", d => {
	          return d.source.y;
	        }).attr("x2", d => {
	          return d.target.x;
	        }).attr("y2", d => {
	          return d.target.y;
	        });

        	nodes.attr("cx", d => {
         		return d.x;
        	}).attr("cy", d => {
          		return d.y;
        	});
        });
     	//
      	// restart simulation
      	//
      	this._forceSim = this._forceSim.alpha(1).restart();
	}

	dragstarted(d) {
    	if (!d3.event.active) this._forceSim.alphaTarget(0.3).restart();
    	d.fx = d.x;
    	d.fy = d.y;
  	}

	dragged(d) {
    	d.fx = d3.event.x;
    	d.fy = d3.event.y;
  	}

	dragended(d) {
    	if (!d3.event.active) this._forceSim.alphaTarget(0);
    	d.fx = null;
    	d.fy = null;
  	}  	
} /* /class */


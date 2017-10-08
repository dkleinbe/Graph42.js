/** @module GraphEditor */
'use strict';

var _ = require('lodash');
//import * as state from "@steelbreeze/state";
import {GraphEditorSM} from "./GraphEditorSM";

//var model = new state.StateMachine("model");
/**
Class to access Neo4j database
**/
export class GraphEditor {
	/**
	**/
	constructor(svg) {
		this._svg = svg; 
		var width = 1500, height = 500;

		this._svg.on("mouseup", () => { this.onMouseUp(); });
		

		this._forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
  			.force("center", d3.forceCenter(width / 2, height / 2));
  		this._forceSim.force("link", d3.forceLink());

  		this._links = svg.append("g").selectAll(".link");
  		this._nodes = svg.append("g").selectAll(".node");

  		this.initFSM();
	}
	/**
	**/
	initFSM() {
		//
		this._fsm = new GraphEditorSM(this);
		this._fsm.init();
	}
	/**
	**/
	renderGraph(graph) {
		this._graph = graph;
	
      	var svg = this._svg;
      	var links = this._links;
      	var nodes = this._nodes;

      	//
      	// Update links
      	//
      	links = links.data(graph.links, function(d) { return d.source.title + "-" + d.target.title; });
      	links = links.enter().append("line").attr("class", "link").merge(links);

	    links.exit().remove();

	    this._links = links;
      	//
      	// Update nodes
      	//
      	nodes = nodes.data(graph.nodes, d => { return d.title; });

      	nodes.attr("class", d => { return "node " + d.label + " update" });

      	nodes.exit().remove();

      	var newNodes = nodes.enter()
	        .append("circle")   
	        .attr("class", d => {
	          return "node " + d.label
	        })
	        .attr("r", 10)
	        .on("mouseover", d => { this._fsm.evaluate("mouseover_node");})
	        .on("mouseout", d => { this._fsm.evaluate("mouseout_node");})
	        .call(d3.drag()
	          .on("start", (d) => this.dragstarted(d))
	          .on("drag", (d) => this.dragged(d))
	          .on("end", (d) => this.dragended(d))
	          .filter(() => this.filterDrag()));

	    newNodes.append("title")
	          .text(d => {
	            return d.title;
	        });
      	
      	nodes = nodes.merge(newNodes);      
      	this._nodes = nodes;
      	//
      	// force feed algo ticks
      	//
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
      	this._forceSim.nodes(graph.nodes);
      	this._forceSim.force("link").links(graph.links);
      	this._forceSim = this._forceSim.alpha(1).restart();
	}

	filterDrag() {
		return true;
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

  	onMouseUp() {

  		this._fsm.evaluate("mouseup");

  	}

  	addNode() {

  		var point = d3.mouse(this._svg.node());
  		var count = this._graph.nodes.length;
  		var newNode = {title: "actor name" + count, label: 'actor', x: point[0], y: point[1]};
  		this._graph.nodes.push(newNode);
  		this._graph.links.push({source: this._graph.nodes[0], target: newNode });
  		//this._graph.links.pop();
  		this.renderGraph(this._graph);

  	}
} /* /class */


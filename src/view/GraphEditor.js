/** @module GraphEditor */
"use strict";

var _ = require("lodash");
// import * as state from "@steelbreeze/state";
import {
	GraphEditorSM
}
from "./fsm/GraphEditorSM";

/**
Class to define force simulation parameters
**/
class ForcesSimulation {
	constructor(width, height, graph) {

		this._width = width;
		this._height = height;
		this._graph = graph;

		this._forceProperties = {
			center: {
				x: 0.5,
				y: 0.5
			},
			charge: {
				enabled: true,
				strength: -80,
				distanceMin: 1,
				distanceMax: 2000
			},
			collide: {
				enabled: true,
				strength: 0.7,
				iterations: 1,
				radius: 35
			},
			forceX: {
				enabled: false,
				strength: 0.1,
				x: 0.5
			},
			forceY: {
				enabled: false,
				strength: 0.1,
				y: 0.5
			},
			link: {
				enabled: true,
				distance: 180,
				iterations: 1
			}
		}

		this._simulation = d3.forceSimulation();

	}
	get forcesProperties() { return this._forceProperties; }
	get forcesSimulation() { return this._simulation; }
	/**
	*/
	initializeForces() {
	// add forces and associate each with a name
		this._simulation
			.force("link", d3.forceLink())
			.force("charge", d3.forceManyBody())
			.force("collide", d3.forceCollide())
			.force("center", d3.forceCenter())
			.force("forceX", d3.forceX())
			.force("forceY", d3.forceY());
			// apply properties to each of the forces
		this.updateForces();
	}
	/**
	apply new force properties
	*/
	updateForces() {
	// get each force by name and update the properties
		let forceProperties = this._forceProperties;

		this._simulation.force("center")
			.x(this._width * forceProperties.center.x)
			.y(this._height * forceProperties.center.y);
		this._simulation.force("charge")
			.strength(forceProperties.charge.strength * forceProperties.charge.enabled)
			.distanceMin(forceProperties.charge.distanceMin)
			.distanceMax(forceProperties.charge.distanceMax);
		this._simulation.force("collide")
			.strength(forceProperties.collide.strength * forceProperties.collide.enabled)
			.radius(forceProperties.collide.radius)
			.iterations(forceProperties.collide.iterations);

		this._simulation.force("forceX")
			.strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
			.x(this._width * forceProperties.forceX.x);
		this._simulation.force("forceY")
			.strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
			.y(this._height * forceProperties.forceY.y);
		this._simulation.force("link")
			.id(function(d) { return d.id; })
			.distance(forceProperties.link.distance)
			.iterations(forceProperties.link.iterations)
			.links(forceProperties.link.enabled ? this._graph.links : []);

		// updates ignored until this is run
		// restarts the simulation (important if simulation has already slowed down)
		this._simulation.alpha(1).restart();
	}

}

class Selection {
	/**
	**/
	constructor() {
		this._nodeSelection = null;
	}
}
// var model = new state.StateMachine("model");
/**
Class to access GraphEditor
**/
export class GraphEditor {
	/**
	 **/
	constructor(svg, graph) {
		this._tickListeners = [];
		this._svg = svg;
		this._graph = graph;
		this._nodesTypesParameters = new Map();
		this._selection = new Selection();

		var width = parseInt(svg.style("width"));
		var	height = parseInt(svg.style("height"));

		// define arrow markers for graph links
		var defs = svg.append("svg:defs");
		defs.append("svg:marker")
			.attr("id", "end-arrow")
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", "52")
			.attr("markerWidth", 3.5)
			.attr("markerHeight", 3.5)
			.attr("strokeWidth", 4)
			.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M0,-5L10,0L0,5");

		// add encompassing group for the zoom
		var canvas = svg.append("g").attr("class", "canvas");
		this._canvas = canvas;

		this._dragline = canvas.append("svg:path")
			.attr("class", "link dragline hidden")
			.attr("d", "M0,0L0,0");
		// .style('marker-end', 'url(#mark-end-arrow)');

		// listen for key events
		// d3.select(window)
		svg
			.on("keydown", () => {
				this.onKeyDown();
			})
			.on("keyup", () => {
				this.onKeyUp();
			})
			.on("focus", function() {
				svg.append("text")
					.attr("x", "5")
					.attr("y", "150")
					.style("font-size", "50px")
					.text("focus")
					.transition().duration(2000)
					.style("font-size", "5px")
					.style("fill-opacity", ".1")
					.remove();
			});

		// listen for mouse button
		this._svg.on("mouseup", () => {
			this.onMouseUp();
		});

		// init nodes color scale
		this._nodesColorScale = d3.scaleOrdinal(d3.schemeSet3);

		// install zoom behavior
		var dragSvg = d3.zoom().on("zoom", () => this.zoomed());
		this._svg.call(dragSvg);

		this._forces = new ForcesSimulation(width, height, this._graph);
		this._forces.initializeForces();
		this._forceSim = this._forces.forcesSimulation;

		this._links = canvas.append("g").selectAll(".link");
		this._nodes = canvas.append("g").selectAll(".node");

		this._relationSelection = null;
		this._targetNode = null;
		this.initFSM();

		this._svg.on("click", () => {
			this._fsm.evaluate("click")
		});

	}
	/**
	*/
	setNodesTypesSet(types) {
		// set default parameters for node rendering
		types.forEach((t, i) => {
			this._nodesTypesParameters.set(t, {
				color: this._nodesColorScale(i),
				size: 10
			});
		})
	}
	/**
	*/
	addTickListener(listener) {
		this._tickListeners.push(listener);
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
		this.render();
	}
	/**
	restart simulation
	*/
	restartSimulation() {
				//
		// restart simulation
		//
		let graph = this._graph;
		this._forceSim.nodes(graph.nodes);
		this._forceSim.force("link").links(graph.links);
		/*
		if (graph.links.length == 0)
			this._forceSim.force("charge").strength(-10);
		else
			this._forceSim.force("charge").strength(-1000);
		*/
		this._forces.updateForces();
	}
	/**
	 **/
	render() {
		var svg = this._canvas;
		var links = this._links;
		var nodes = this._nodes;
		let graph = this._graph;
		//
		// Update links
		//
		links = links.data(graph.links, function(d) {
			return d.identity;
		});

		links.exit().remove();

		var newLinks = links.enter().append("g")
			.attr("class", "link")
			.on("mouseover", (d, i, links) => {
				this._fsm.evaluate("mouseover_link", d, links[i]);
			})
			.on("mouseleave", (d, i, links) => {
				this._fsm.evaluate("mouseleave_link", d, links[i]);
			})
			.on("click", (d, i, links) => {
				if (d3.event.defaultPrevented) return;
				this._fsm.evaluate("click", d, links[i]);
			});

		// add path and arrow
		newLinks.append("path")
			.attr("class", "link")
			.style("stroke-width", 2)
			.style("fill", "none")
			.style("marker-end", "url(#end-arrow)");

		// add path for text
		newLinks.append("path")
			.attr("class", "text-link")
			.style("fill", "none")
			.attr("id", (d, i) => {
				return "edgepath" + d.identity
			});

		// add label on path
		var edgeLabels = newLinks.append("text").style("stroke-width", 0);

		edgeLabels.append("textPath")
			.attr("text-anchor", "middle")
			// aligns the text at the middle of the path (only with text-anchor=middle)
			.attr("startOffset", "50%")
			.attr("xlink:href", (d, i) => {
				return "#edgepath" + d.identity
			})
			.text(d => {
				return d.type;
			});

		// add tooltip
		newLinks.append("title")
			.text(d => {
				return d.identity;
			});

		links = links.merge(newLinks);
		this._links = links;

		var textPath = links.selectAll("path.text-link");
		var path = links.selectAll("path.link");
		edgeLabels = links.selectAll("text");

		//
		// Update nodes
		//
		nodes = nodes.data(graph.nodes, d => {
			return d.identity;
		}).classed("update", true); ;

		nodes.exit().remove();
		//
		// node group
		//
		var newNodes = nodes.enter().append("g")
			.attr("class", d => {
				return "node " + d.label + " new"
			})
			.on("mouseover", (d, i, nodes) => {
				this._fsm.evaluate("mouseover_node", d, nodes[i]);
			})
			.on("mouseleave", (d, i, nodes) => {
				this._fsm.evaluate("mouseleave_node", d, nodes[i]);
			})
			.on("click", (d, i, nodes) => {
				if (d3.event.defaultPrevented) return;
				d3.event.stopPropagation();
				this._fsm.evaluate("click", d, nodes[i]);
			})
			.on("dblclick", (d, i, nodes) => {
				this._fsm.evaluate("dblclick", d, nodes[i]);
			})
			.call(d3.drag()
				.on("start", (d, i, nodes) => {
					// d3.event.sourceEvent.stopPropagation();
					// console.log('******** START ***********');
					this._fsm.evaluate("drag_node_started", d, nodes[i]);
				})
				.on("drag", (d, i, nodes) => {
					// console.log('******** DRAG *********** dx: ' + d3.event.dx + " dy: " + d3.event.dy);
					// Only fire drag event if we get an effective move
					if (d3.event.dx || d3.event.dy) {
						this._fsm.evaluate("node_dragged", d, nodes[i]);
					}
				})
				.on("end", (d, i, nodes) => {
					// console.log('******** END ***********');
					this._fsm.evaluate("drag_node_ended", d, nodes[i]);
				})
			);
		//
		// node circle
		//
		newNodes.append("circle")
			.attr("r", 30)
			.attr("fill", d => {
				return this._nodesTypesParameters.get(d.label).color;
			});
		//
		// node text
		//
		newNodes.append("foreignObject")
					.attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
					.attr("width", 60)
					.attr("height", 60)
					.attr("x", -30)
					.attr("y", -30)
					.append("xhtml:p")
						.attr("class", "p_node_text")
						.style("height", "60px")
						.style("width", "60px")
						.style("line-height", "60px")
						.append("tspan")
							.attr("class", "node_text")
							.text(d => {
								if (d.properties.hasOwnProperty("name")) {
									return d.properties.name;
								} else {
									return d.properties[_.keys(d.properties)[0]];
								}
							})
		//
		// node tooltip
		//
		newNodes.append("title")
			.text(d => {
				return d.identity;
			});
		//
		// merge nodes
		//
		nodes = nodes.merge(newNodes);
		this._nodes = nodes;

	// DATA FORMATTING

		_.each(graph.links, function(link) {

			// find other links with same target+source or source+target
			var same = _.filter(graph.links, (l) => { return (l.target.isSame(link.target) && l.source.isSame(link.source)) });
			var sameAlt = _.filter(graph.links, (l) => { return (l.target.isSame(link.source) && l.source.isSame(link.target)) });
			var sameAll = same.concat(sameAlt);

			_.each(sameAll, function(s, i) {
				// s.sameNone = false;
				s.sameIndex = (i + 1);
				s.sameTotal = sameAll.length;
				s.sameTotalHalf = (s.sameTotal / 2);
				s.sameUneven = ((s.sameTotal % 2) !== 0);
				s.sameMiddleLink = ((s.sameUneven === true) && (Math.ceil(s.sameTotalHalf) === s.sameIndex));
				s.sameLowerHalf = (s.sameIndex <= s.sameTotalHalf);
				s.sameArcDirection = s.sameLowerHalf ? 0 : 1;
				s.sameIndexCorrected = s.sameLowerHalf ? s.sameIndex : (s.sameIndex - Math.ceil(s.sameTotalHalf));
			});

			if (sameAll.length > 1) {
				console.log(sameAll.length)
			} else {
				// link.sameNone = true;
				link.sameTotal = 0;
			}
		});

		if (graph.links.length !== 0) {
			var maxSame = _.chain(graph.links)
				.sortBy(function(x) {
					return x.sameTotal;
				})
				.last()
				.value().sameTotal;
		}
		_.each(graph.links, function(link) {
			link.maxSameHalf = Math.floor(maxSame / 3) + 1;
		});
		//
		// force feed algo ticks
		//
		this._forceSim.on("tick", () => {
			// relation link with arrow

			path.attr("d", (d) => this.linkArc(d));
			textPath.attr("d", (d) => this.linkArc(d, true));

			// move node
			nodes.attr("transform", function(d, i) {
				return "translate(" + d.x + "," + d.y + ")";
			});

			this._tickListeners.map((listener) => listener(this._forceSim.alpha()));
		});
		//
		// restart simulation
		//
		this.restartSimulation();

	}
	/**
	 ARC CALCULATION
	 some more info: http://stackoverflow.com/questions/11368339/drawing-multiple-edges-between-two-nodes-with-d3
	*/
	linkArc(d, orient) {

		var dx = (d.target.x - d.source.x);
		var	dy = (d.target.y - d.source.y);
		var	dr = Math.sqrt(dx * dx + dy * dy);
		var	unevenCorrection = (d.sameUneven ? 0 : 0.5);
		var	arc = ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));

		if (d.sameMiddleLink) {
			arc = 0;
		}
		if (orient === true) {
			var path;
			if (d.target.x > d.source.x) {
				return "M" + d.source.x + "," + d.source.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y;
			}	else {
				return "M" + d.target.x + "," + d.target.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.source.x + "," + d.source.y;
			}

		} else {
			return "M" + d.source.x + "," + d.source.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y;
		}
	}

	isShiftDown() {
		return (d3.event.sourceEvent !== undefined ? d3.event.sourceEvent.shiftKey : d3.event.shiftKey);
	}

	isCtrlDown() {
		return d3.event.ctrlKey;
	}

	isSelectedNode(n) {
		return n === this._selection._nodeSelection;
	}

	filterDrag() {
		return true;
	}

	unPinNode(d, n) {

		if (!d3.event.active) this._forceSim.alphaTarget(0.0001).restart();
		d.fx = null;
		d.fy = null;
	}

	dragstarted(d, n) {

		// if (!d3.event.active)
		this._forceSim.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	dragged(d) {

		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	dragended(d, n) {

		if (!d3.event.active) this._forceSim.alphaTarget(0.0001);
	}

	dragLine(d, n) {
		this._dragline.attr("d", "M" + d.x + "," + d.y + "L" + d3.event.x + "," + d3.event.y);
	}

	dragLineVisibility(v) {
		this._dragline.classed("hidden", !v);
	}

	onMouseUp() {

		this._fsm.evaluate("mouseup");

	}

	onKeyDown() {

		switch (d3.event.keyCode) {
		case 0x8:
			this._fsm.evaluate("BACKSPACE_KEY");
			break;
		}
	}

	zoomed() {
		this._canvas.attr("transform", d3.event.transform)
	}

	onKeyUp() {}

	addNode() {

		var point = d3.mouse(this._svg.node());
		var count = this._graph.nodes.length;
		var newNode = {
			title: "actor name" + count,
			label: "actor",
			x: point[0],
			y: point[1]
		};
		this._graph.nodes.push(newNode);
		// this._graph.links.push({source: this._graph.nodes[0], target: newNode });
		// this._graph.links.pop();
		this.renderGraph(this._graph);

	}

	addRelation(d, n) {
		var newRel = {
			source: this._selection._nodeSelection,
			target: this._targetNode
		};
		// this._graph.links.push(newRel);
		this._graph.addLink(this._selection._nodeSelection, this._targetNode);
		this.dragLineVisibility(false);
		this.renderGraph(this._graph);
	}

	deleteSelection(d, n) {
		//
		// delete nodes
		//
		if (this._selection._nodeSelection != null) {
			this._graph.nodes.splice(this._graph.nodes.indexOf(this._selection._nodeSelection), 1);
			this.spliceLinksForNode(this._selection._nodeSelection);
		}
		//
		// delete relations
		//
		if (this._relationSelection != null) {
			this._graph.links.splice(this._graph.links.indexOf(this._relationSelection), 1);
		}
		this.renderGraph(this._graph);
	}
	/**
		Removes all links referencing a node
		TODO: should probably be moved to Graph class
	*/
	spliceLinksForNode(node) {
		var toSplice = this._graph.links.filter((l) => {
			return (l.source === node || l.target === node);
		});
		toSplice.map((l) => {
			this._graph.links.splice(this._graph.links.indexOf(l), 1);
		});
	};

	highlightNode(d, n) {
		// d.classed('update');
		this._targetNode = d;
		d3.select(n).classed("over", true);
	}

	unHighlightNode(d, n) {
		// d.classed('update');
		d3.select(n).classed("over", false);
	}

	selectNode(d, n) {
		// select or deselect node
		// deselect node, re-highlight it
		if (d === this._selection._nodeSelection) {
			this._selection._nodeSelection = null;
			this.unselectAll();

			this.highlightNode(d, n);
		} else { // select node un-highlight it
			console.log("Node selected: " + d);
			this.unselectAll();
			this.unHighlightNode(d, n);
			d3.select(n).classed("selected", true);
			this._selection._nodeSelection = d;
		}
	}

	selectLink(d, n) {
		this.unselectAll();
		d3.select(n).classed("selected", true);
		this._relationSelection = d;
	}

	unselectAll() {
		d3.selectAll(".node, .link").classed("selected", false);
		this._selection._nodeSelection = null;
		this._relationSelection = null;
	}

} /* /class */

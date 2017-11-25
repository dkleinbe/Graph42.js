/** @module GraphEditor */
'use strict';

var _ = require('lodash');
//import * as state from "@steelbreeze/state";
import { GraphEditorSM } from "./fsm/GraphEditorSM";

//var model = new state.StateMachine("model");
/**
Class to access GraphEditor
**/
export class GraphEditor {
  /**
   **/
  constructor(svg) {
    this._svg = svg;

    var width = parseInt(svg.style('width')),
      height = parseInt(svg.style('height'));

    this._dragline = svg.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');
    //.style('marker-end', 'url(#mark-end-arrow)');

    // listen for key events
    d3.select(window)
      .on("keydown", () => { this.onKeyDown(); })
      .on("keyup", () => { this.onKeyUp(); });

    // list for mouse button  
    this._svg.on("mouseup", () => { this.onMouseUp(); });


    this._forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));
    this._forceSim.force("link", d3.forceLink());

    this._links = svg.append("g").selectAll(".link");
    this._nodes = svg.append("g").selectAll(".node");

    this._nodeSelection = null;
    this._relationSelection = null;
    this._targetNode = null;
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
    links = links.data(graph.links, function(d) { return d.source.identity + "-" + d.target.identity; });

    links.exit().remove();

    var newLinks = links.enter()
      .append("line")
      .attr("class", "link")
      .on("mouseover", (d, i, links) => { this._fsm.evaluate("mouseover_link", d, links[i]); })
      .on("mouseleave", (d, i, links) => { this._fsm.evaluate("mouseleave_link", d, links[i]); })
      .on("click", (d, i, links) => { if (d3.event.defaultPrevented) return;
        this._fsm.evaluate("click", d, links[i]); })
      .merge(links);

    links = links.merge(newLinks);
    this._links = links;
    //
    // Update nodes
    //
    nodes = nodes.data(graph.nodes, d => { return d.identity; });

    nodes.exit().remove();

    var newNodes = nodes.enter()
      .append("circle")
      .attr("class", d => {
        return "node " + d.label + " update"
      })
      .attr("r", 10)
      .on("mouseover", (d, i, nodes) => { this._fsm.evaluate("mouseover_node", d, nodes[i]); })
      .on("mouseleave", (d, i, nodes) => { this._fsm.evaluate("mouseleave_node", d, nodes[i]); })
      .on("click", (d, i, nodes) => { if (d3.event.defaultPrevented) return;
        this._fsm.evaluate("click", d, nodes[i]); })
      .on("dblclick", (d, i, nodes) => { this._fsm.evaluate("dblclick", d, nodes[i]); })
      .call(d3.drag()
        .on("start", (d, i, nodes) => { d3.event.sourceEvent.stopPropagation();
          this._fsm.evaluate("drag_node_started", d, nodes[i]) })
        .on("drag", (d, i, nodes) => this._fsm.evaluate("node_dragged", d, nodes[i]))
        .on("end", (d, i, nodes) => this._fsm.evaluate("drag_node_ended", d, nodes[i]))
        .filter(() => this.filterDrag())
        .clickDistance(0));

    newNodes.append("title")
      .text(d => {
        return d.identity;
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

  isShiftDown() {
    return (d3.event.sourceEvent !== undefined ? d3.event.sourceEvent.shiftKey : d3.event.shiftKey);
  }

  isCtrlDown() {
    return d3.event.ctrlKey;
  }

  isSelectedNode(n) {
    return n === this._nodeSelection;
  }

  filterDrag() {
    return true;
  }

  unPinNode(d, n) {

    if (!d3.event.active) this._forceSim.alphaTarget(0.3).restart();
    d.fx = null;
    d.fy = null;
  }

  dragstarted(d, n) {

    if (!d3.event.active) this._forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d, n) {

    if (!d3.event.active) this._forceSim.alphaTarget(0);
    //d.fx = null;
    //d.fy = null;
  }

  dragLine(d, n) {
    this._dragline.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.event.x + ',' + d3.event.y);
  }

  dragLineVisibility(v) {
    this._dragline.classed('hidden', !v);
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

  onKeyUp() {}

  addNode() {

    var point = d3.mouse(this._svg.node());
    var count = this._graph.nodes.length;
    var newNode = { title: "actor name" + count, label: 'actor', x: point[0], y: point[1] };
    this._graph.nodes.push(newNode);
    //this._graph.links.push({source: this._graph.nodes[0], target: newNode });
    //this._graph.links.pop();
    this.renderGraph(this._graph);

  }

  addRelation(d, n) {
    var newRel = { source: this._nodeSelection, target: this._targetNode };
    //this._graph.links.push(newRel);
    this._graph.addLink(this._nodeSelection, this._targetNode);
    this.dragLineVisibility(false);
    this.renderGraph(this._graph);
  }

  deleteSelection(d, n) {
    //
    // delete nodes
    //
    if (this._nodeSelection != null) {
      this._graph.nodes.splice(this._graph.nodes.indexOf(this._nodeSelection), 1);
      this.spliceLinksForNode(this._nodeSelection);
    }
    //
    // delete relations
    //
    if (this._relationSelection != null) {
      this._graph.links.splice(this._graph.links.indexOf(this._relationSelection), 1);
    }
    this.renderGraph(this._graph);
  }

  spliceLinksForNode(node) {
    var toSplice = this._graph.links.filter((l) => {
      return (l.source === node || l.target === node);
    });
    toSplice.map((l) => {
      this._graph.links.splice(this._graph.links.indexOf(l), 1);
    });
  };

  highlightNode(d, n) {
    //d.classed('update');
    this._targetNode = d;
    d3.select(n).classed('over', true);
  }

  unHighlightNode(d, n) {
    //d.classed('update');
    d3.select(n).classed('over', false);
  }

  selectNode(d, n) {
    console.log('Node selected: ' + d);

    this.unselectAll();
    this.unHighlightNode(d, n);
    d3.select(n).classed('selected', true);
    this._nodeSelection = d;
  }

  selectLink(d, n) {
    this.unselectAll();
    d3.select(n).classed('selected', true);
    this._relationSelection = d;
  }

  unselectAll() {
    d3.selectAll(".node, .link").classed('selected', false);
    this._nodeSelection = null;
    this._relationSelection = null;
  }
} /* /class */

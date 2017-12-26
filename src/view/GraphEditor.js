/** @module GraphEditor */
'use strict';

var _ = require('lodash');
//import * as state from "@steelbreeze/state";
import {
    GraphEditorSM
}
from "./fsm/GraphEditorSM";

//var model = new state.StateMachine("model");
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

        var width = parseInt(svg.style('width')),
            height = parseInt(svg.style('height'));

        // define arrow markers for graph links
        var defs = svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', "52")
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('strokeWidth', 4)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        //add encompassing group for the zoom 
		var canvas = svg.append("g").attr("class", "canvas");
		this._canvas = canvas;

        this._dragline = canvas.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0');
        //.style('marker-end', 'url(#mark-end-arrow)');

        // listen for key events
        d3.select(window)
            .on("keydown", () => {
                this.onKeyDown();
            })
            .on("keyup", () => {
                this.onKeyUp();
            });

        // list for mouse button  
        this._svg.on("mouseup", () => {
            this.onMouseUp();
        });
        // install zoom behavior
        var dragSvg = d3.zoom().on("zoom", () => this.zoomed());
        this._svg.call(dragSvg);

        this._forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));
        this._forceSim.force("charge").strength(-100);

        this._forceSim.force("collide", d3.forceCollide())
        this._forceSim.force("collide")
        	.strength(0.7)
        	.radius(30)
        	.iterations(1);

        this._forceSim.force("link", d3.forceLink());
        this._forceSim.force("link").distance(100);

        this._links = canvas.append("g").selectAll(".link");
        this._nodes = canvas.append("g").selectAll(".node");

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
        this.render();
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

        // add paht line
        newLinks.append("path")
            .attr("id", (d, i) => {
                return 'edgepath' + i
            });

        // add path for text and arrow
        newLinks.append("path")
            .attr("id", (d, i) => {
                return 'edgepath' + i
            })
            .style('stroke-width', 2)
            .style('marker-end', 'url(#end-arrow)');

        // add label on path
        var edgeLabels = newLinks.append('text');

        edgeLabels.append('textPath')
            .attr('text-anchor', 'middle')
            // aligns the text at the middle of the path (only with text-anchor=middle)
            .attr('startOffset', '50%')
            .attr('xlink:href', (d, i) => {
                return '#edgepath' + i
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

        var path = links.selectAll("path");
        var textPath = links.selectAll("textPath");
        edgeLabels = links.selectAll("text");
        
        
        //
        // Update nodes
        //
        nodes = nodes.data(graph.nodes, d => {
            return d.identity;
        }).classed('update', true);;

        nodes.exit().remove();
        //
        // node group
        //
        var newNodes = nodes.enter().append("g")
            .attr("class", d => {
                return "node " + d.label + " new"
            })
            .call(d3.drag()
                .on("start", (d, i, nodes) => {
                    d3.event.sourceEvent.stopPropagation();
                    this._fsm.evaluate("drag_node_started", d, nodes[i])
                })
                .on("drag", (d, i, nodes) => this._fsm.evaluate("node_dragged", d, nodes[i]))
                .on("end", (d, i, nodes) => this._fsm.evaluate("drag_node_ended", d, nodes[i]))
                .filter(() => this.filterDrag())
                .clickDistance(0))
            .on("mouseover", (d, i, nodes) => {
                this._fsm.evaluate("mouseover_node", d, nodes[i]);
            })
            .on("mouseleave", (d, i, nodes) => {
                this._fsm.evaluate("mouseleave_node", d, nodes[i]);
            })
            .on("click", (d, i, nodes) => {
                if (d3.event.defaultPrevented) return;
                this._fsm.evaluate("click", d, nodes[i]);
            })
            .on("dblclick", (d, i, nodes) => {
                this._fsm.evaluate("dblclick", d, nodes[i]);
            });
        //
        // node circle
        //
        newNodes.append("circle").attr("r", 30);
        //
        // node text
        //
        newNodes.each(function(n, j) {

            let g = d3.select(this);
            var words = ["no name"];
            if (n.properties.hasOwnProperty('name')) {
                words = n.properties.name.split(/\s+/g)
            }
            else
            {
            	// get first property as label
            	words = n.properties[_.keys(n.properties)[0]].split(/\s+/g)
            }
            let t = g.append("text").attr("text-anchor", "middle");

            words.forEach((w, i) => {
                let tspan = t.append('tspan').text(w);
                if (i > 0)
                    tspan.attr('x', 0).attr('dy', '15');
                else
                	tspan.attr('x', 0).attr('dy', '-15');
            });
        });
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
        //
        // force feed algo ticks
        //
        this._forceSim.on("tick", () => {

            path.attr('d', function(d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                //console.log(d)
                return path
            });
            // switch label according to orientation            
            edgeLabels.attr('transform', (d, i, labels) => {
                if (d.target.x < d.source.x) {
                    let bbox = labels[i].getBBox();
                    let rx = bbox.x + bbox.width / 2;
                    let ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
            }).attr('dy', (d, i, labels) => {
            	if (d.target.x < d.source.x) {
                    return 15;
                }
                else {
                    return -5;
                }
            });

            nodes.attr("transform", function(d, i) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            this._tickListeners.map((listener) => listener(this._forceSim.alpha()));
        });
        //
        // restart simulation
        //
        this._forceSim.nodes(graph.nodes);
        this._forceSim.force("link").links(graph.links);
        if (graph.links.length == 0)
            this._forceSim.force("charge").strength(-10);
        else
            this._forceSim.force("charge").strength(-100);
        this._forceSim = this._forceSim.alpha(0.3).restart();
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

        if (!d3.event.active) this._forceSim.alphaTarget(0.0001).restart();
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

        if (!d3.event.active) this._forceSim.alphaTarget(0.0001);
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

    zoomed() {
    	this._canvas.attr("transform", d3.event.transform)
    }

    onKeyUp() {}

    addNode() {

        var point = d3.mouse(this._svg.node());
        var count = this._graph.nodes.length;
        var newNode = {
            title: "actor name" + count,
            label: 'actor',
            x: point[0],
            y: point[1]
        };
        this._graph.nodes.push(newNode);
        //this._graph.links.push({source: this._graph.nodes[0], target: newNode });
        //this._graph.links.pop();
        this.renderGraph(this._graph);

    }

    addRelation(d, n) {
        var newRel = {
            source: this._nodeSelection,
            target: this._targetNode
        };
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

    addTickListener(listener) {
        this._tickListeners.push(listener);
    }
} /* /class */
/** @module Graph */
'use strict';

import { grdb } from '../GraphDatabase';
var _ = require('lodash');
/**
Class to access Neo4j database
**/
export class Graph {
	/**
	**/
	constructor(nodes, links) {
		this._nodes = [];
		this._links = []; 

		nodes.map(node => this.addNode(node));
		links.map(node => this.addLink(link));
	}
	get nodes() { return this._nodes; }
	get links() { return this._links; }
	/**
	**/
	addNode(node) {
		this._nodes.push(new Node(this, node));
	}
	/**
	**/
	addLink(src, dest) {
		let rel = grdb.createRelationship(-1, src.identity, dest.identity, "", []);
		this._links.push(new Link(this, rel));
	}
}

export class Node {
	constructor(graph, node) {
		_.extend(this, node);
		this._graph = graph;
	}
	get label() { return this.labels[0]; }
}

export class Link {
	constructor(graph, link) {
		_.extend(this, link);
		this._graph = graph;
	}
	get source() { return _.find(this._graph._nodes, (n) => { return n.identity == this.start; }); }
	get target() { return _.find(this._graph._nodes, (n) => { return n.identity == this.end; }); }
}
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
	constructor(nodes = [], links = []) {
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
	addNodeSet(nodes) {
		// TODO: check for duplicates
		nodes.map(node => this.addNode(node));
	}
	/**
	**/
	removeNodeSet(nodes) {
		_.pullAllWith(this._nodes, nodes, (v1, v2) => { return v1.isSame(v2); });
	}
	/**
	 **/
	addLink(src, dest) {
		let rel = grdb.createRelationship(-1, src.identity, dest.identity, "", []);
		this._links.push(new Link(this, rel));
	}
	/**
	**/
	addLinkSet(rels) {
		// TODO: check for duplicates
		rels.map(rel => this._links.push(new Link(this, rel)));
	}	
	/**
	**/
	static isSameIdentity(e1, e2) {
		return e1.low == e2.low && e1.high == e2.high;
	}
}

export class Node {
	constructor(graph, node) {
		_.extend(this, node);
		this._graph = graph;
	}
	get label() { return this.labels[0]; }
	isSame(node) { return Graph.isSameIdentity(this.identity, node.identity); }
}

export class Link {
	constructor(graph, link) {
		_.extend(this, link);
		this._graph = graph;
	}
	get source() { return _.find(this._graph._nodes, (n) => { return Graph.isSameIdentity(n.identity, this.start); }); }
	get target() { return _.find(this._graph._nodes, (n) => { return Graph.isSameIdentity(n.identity, this.end); }); }
}

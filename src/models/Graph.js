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
		this._nodes = new Set();
		this._links = new Set();

		nodes.map(node => this.addNode(node));
		links.map(node => this.addLink(link));
	}
	/**
	return array of nodes
	*/
	get nodes() { return [...this._nodes] }
	/**
	returns array of links
	*/
	get links() { return [...this._links] }
	/**
	 **/
	addNode(node) {
		node._graph = this;
	 	this._nodes.add(node);
	}
	/**
	**/
	addNodeSet(nodes) {
		
		nodes.forEach(node => this.addNode(node));
	}
	/**
	**/
	removeNodeSet(nodes) {
		//_.pullAllWith(this._nodes, nodes, (v1, v2) => { return v1.isSame(v2); });
		nodes.forEach(n1 => { 
			for (var n2 of this._nodes) {
				if (n1.isSame(n2)) {
					this._nodes.delete(n2);
					break;
				}
			}
		});
	}
	/**
	 **/
	addLink(link) {
		link._graph = this;
		this._links.add(link);
	}
	/**
	**/
	addLinkSet(links) {
		
		links.forEach(link => this.addLink(link));
	}	
	/**
	**/
	static isSameIdentity(e1, e2) {
		return e1.low == e2.low && e1.high == e2.high;
	}
}

export class Node {
	constructor(node) {
		_.extend(this, node);
		this._graph = undefined;
	}
	get label() { return this.labels[0]; }
	isSame(node) { return Graph.isSameIdentity(this.identity, node.identity); }
}

export class Link {
	constructor(link) {
		_.extend(this, link);
		this._graph = undefined;
	}
	get source() { return _.find(this._graph._nodes, (n) => { return Graph.isSameIdentity(n.identity, this.start); }); }
	get target() { return _.find(this._graph._nodes, (n) => { return Graph.isSameIdentity(n.identity, this.end); }); }
}

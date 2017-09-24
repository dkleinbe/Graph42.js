/** @module Graph */
'use strict';

var _ = require('lodash');
/**
Class to access Neo4j database
**/
export class Graph {
	constructor(nodes, links) {
		this.nodes_ = nodes;
		this.links_ = links; 
	}
}

export class Node {
	constructor() {

	}
}

export class Link {
	constructor(src, dest) {
		this.src_ = src;
		this.dest_ = dest;
	}
}
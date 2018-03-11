/** @module GraphDatabase */
'use strict';

require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
import { Graph, Node, Link } from './models/Graph.js';
var _ = require('lodash');

/**
Class to access Neo4j database
**/
export default class GraphDatabase {
	/**
	 */
	constructor() {
		console.log('new GraphDatabase');
		this.connect();
	}
	/**
	Initialize de connection to the database
	**/
	connect() {
		this.neo4j = window.neo4j.v1;
		this.driver = this.neo4j.driver("bolt://localhost", this.neo4j.auth.basic("neo4j", "642lccost"));
	}
	/**
	Gets the set of node labels currently defined within the graph : `MATCH (n) RETURN DISTINCT LABELS(n) as label;`
	@returns {map}
	**/
	getNodeLabelsSet() {
		var session = this.driver.session();
		return session
			.run(
				"MATCH (n) RETURN DISTINCT LABELS(n) as label;")
			.then(result => {
				session.close();

				if (_.isEmpty(result.records)) {
					return null;
				}

				return result.records.map(record => {
					return record.get('label')
				});
			})
			.catch(error => {
				session.close();
				throw error;
			});
	}
	/**
	Gets the set of relationship types currently defined within the graph : `MATCH (s)-[n]-(e) RETURN DISTINCT type(n) as type;`
	@returns {map}
	**/
	getRelationshipTypes() {
		var session = this.driver.session();
		return session
			.run(
				"MATCH (s)-[n]-(e) RETURN DISTINCT type(n) as type;")
			.then(result => {
				session.close();

				if (_.isEmpty(result.records)) {
					return null;
				}

				return result.records.map(record => {
					return record.get('type')
				});
			})
			.catch(error => {
				session.close();
				throw error;
			});
	}
	/**
	 **/
	getGraphNodesByLabel(labels, limit) {
		let session = this.driver.session();
		let query = "MATCH (n) WHERE " +
			labels.map(function(item) { return "n:" + item; }).join(' OR ') +
			"  RETURN n LIMIT {limit};";

		return session
			.run(query, { limit: limit })
			.then(result => {
				session.close();
				let graph = new Graph();

				// if (_.isEmpty(result.records))
				//	return null;

				result.records.map(record => {
					graph.addNode(new Node(record.get('n')));
				})

				return graph;
			})
	}
	/**
	 *
	 *
	 * @param {any} labels
	 * @param {any} relationships
	 * @param {any} limit
	 * @returns {Graph}
	 * @memberof GraphDatabase
	 */
	getGraphByRelationship(labels, relationships, limit) {
		let session = this.driver.session();
		let query =
			"MATCH (n)-[r" + relationships.map(r => { return ":" + r }).join('|') + "]-(m) " +
			"WHERE (" + labels.map(function(item) { return "n:" + item; }).join(' OR ') +
				") AND " + labels.map(function(item) { return "m:" + item; }).join(' OR ') +
			" RETURN n,r,m LIMIT {limit};"

		console.log(query);
		return session
			.run(query, {limit: limit})
			.then(result => {
				session.close();
				let graph = new Graph();

				console.log(result.records);
				result.records.map(record => {
					graph.addNode(new Node(record.get('n')));
					graph.addNode(new Node(record.get('m')));
					graph.addLink(new Link(record.get('r')));
				})

				return graph;
			})
	}
	/**
	 * Update all properties of a node
	 *
	 * @param {Node} node
	 * @returns ??
	 * @memberof GraphDatabase
	 */
	updateNode(node) {
		let session = this.driver.session();
		let query =
			"MATCH (n) WHERE ID(n) = " + node.identity +
			" SET n = $props" + ", n:" + node.label +
			" RETURN n;"
		// console.log(query);
		let props = { props: node.properties };
		return session
			.run(query, props)
			.then(result => {
				session.close()
				// console.log(result.records);
				return result;
			})
	}
	/**
	 **/
	createNode() {
		let session = this.driver.session();
		let query = "CREATE (n) RETURN n;";

		return session
			.run(query)
			.then(result => {
				session.close()
				// console.log(result.records);
				let node = result.records[0].get('n');
				return (new Node(node));
			});
		// return new this.neo4j.Node();
	}
	/**
	 **/
	createRelationship(identity, start, end, type, properties) {
		return new this.neo4j.types.Relationship(identity, start, end, type, properties);
	}
}

export let grdb = new GraphDatabase();

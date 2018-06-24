/** @module GraphDatabase */
'use strict';

require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
import { Graph, Node, Link } from './models/Graph.js';

var _ = require('lodash');

export class GraphDatabaseSchema {
	constructor(schema) {
		this._schema = schema
	}
	/**
	 * Return array of labels defined in the schema
	 *
	 * @returns labels
	 * @memberof GraphDatabaseSchema
	 */
	getNodeLabelsSet() {
		let labels = []

		_.mapKeys(this._schema, (value, key) => {
			
			if (value.type === 'node') {
				labels.push(key)
			}
		})
		return labels
	}
	/**
	 * Retrun properties of a schema element
	 * 
	 * @param {any} node label element 
	 * @returns properties
	 * @memberof GraphDatabaseSchema
	 */
	getNodeProperties(node) {
		let properties = {}
		_.mapKeys(this._schema[node].properties, (value, key) => {
			// properties.push({ name: key, type: value.type });
			switch (value.type) {
				case 'STRING':
					properties[key] = "string"
					break
				case 'INTEGER':
					properties[key] = 0
					break
				default:
					properties[key] = value.type
					break
			}
			
		})
		return properties
	}
	getLinkProperties(type) {

	}
	getPropertyType(elt, prop) {
		let property = this._schema[elt].properties[prop]
		switch (property.type) {
			case 'STRING':
				return typeof "string"
			case 'INTEGER':
				return typeof 666
			default:
				return typeof "string"
		}
	}
}
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
		this.getSchemaGraph().then(g => { this._schemaGraph = g })
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
	 *
	 *
	 * @returns
	 * @memberof GraphDatabase
	 */
	getSchema() {
		let session = this.driver.session();
		let query = "CALL apoc.meta.schema";

		return session
			.run(query)
			.then(result => {
				session.close();
				
				result.records.map(record => {
					
					let schema = record.get('value')
					this._schema = new GraphDatabaseSchema(schema)
					console.log(this._schema.getNodeProperties('Movie'))

					_.mapKeys(schema, (value, key) => {
						console.log("key: " + key + " type: ", schema[key].type)
						let nodes = this._schemaGraph._nodes
						let links = this._schemaGraph._links
						switch (schema[key].type) {
							case 'node': {
								console.log(key)
								// find node in schema graph
								let nodeIndex = _.findIndex(nodes, n => { return n.label === key })
								console.log("node: " + nodes[nodeIndex])
								// add properties to node
								_.mapKeys(schema[key].properties, (value, k) => {
									nodes[nodeIndex].properties[k] = value.type
								})
								break
							}
							case 'relationship': {
								// find link in schema graph
								let linkIndex = _.findIndex(links, n => { return n.type === key })
								console.log("link: " + links[linkIndex])
								// add properties to link
								_.mapKeys(schema[key].properties, (value, k) => {
									links[linkIndex].properties[k] = value.type
								})
								break
							}
							default: {
								console.log('default type')
							}
						}
					})
				});
				return this._schemaGraph;
			})
	}
	/**
	 * Returns virtual graph that represents the labels and relationship-types
	 * available in your database and how they are connected.
	 *
	 * @memberof GraphDatabase
	 * @returns Graph
	 */
	getSchemaGraph() {
		let session = this.driver.session();
		let query = "CALL apoc.meta.graph";

		return session
			.run(query)
			.then(result => {
				session.close();
				let graph = new Graph();

				console.log(result.record);
				result.records.map(record => {
					record.get('nodes').map(node => {
						graph.addNode(new Node(node));
					})
					record.get('relationships').map(rel => {
						graph.addLink(new Link(rel));
					})
				});
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
		// convert properties to the right type
		// TODO: add other types management
		_.mapKeys(node.properties, (value, key) => {
			switch (this._schema.getPropertyType(node.label, key)) {
				case 'number':
					node.properties[key] = Number(value)
					break

				default:
					break
			}
		})
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

/** @module GraphDatabase */
'use strict';

require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
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

				if (_.isEmpty(result.records))
					return null;

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

				if (_.isEmpty(result.records))
					return null;

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
		let query = "MATCH (n) WHERE labels(n) in [" +
			labels.map(function(item) { return "'" + item + "'" }).join(',') +
			"] RETURN n LIMIT {limit};";

		return session
			.run(query, { limit: limit })
			.then(result => {
				session.close();
				let nodes = [];
				let links = [];

				//if (_.isEmpty(result.records))
				//	return null;

				result.records.map(record => {
					nodes.push(record.get('n'));
				})

				return { nodes, links: links };
			})
	}
	/**
	 **/
	createNode() {
		return new this.neo4j.Node();
	}
	/**
	 **/
	createRelationship(identity, start, end, type, properties) {
		return new this.neo4j.types.Relationship(identity, start, end, type, properties);
	}
}

export let grdb = new GraphDatabase();

<template>
<div class="roles">
  <v-container>
  	<p>Nb nodes: {{nbNodes}} | Nb relations: {{nbRelations}}</p>
    <v-chip v-for="role in roles"
            :key="role.role"
            v-on:click="toggleRole(role)"
            color="teal"
            text-color="white">
      <v-avatar>
        <v-icon v-if="role.checked">check_circle</v-icon>
      </v-avatar>
      {{role.role}}
    </v-chip>
  </v-container>
  <v-divider></v-divider>
  <v-container>
    <v-chip v-for="relation in relations"
            :key="relation.relation"
            v-on:click="toggleRelation(relation)"
            color="teal"
            text-color="white">
      <v-avatar>
        <v-icon v-if="relation.checked">check_circle</v-icon>
      </v-avatar>
      {{relation.relation}}
    </v-chip>
  </v-container>  
  <!-- <pre>{{ $data }}</pre> -->
</div>

</template>

<script type="text/javascript">
import { grdb } from '../GraphDatabase';
import { Graph } from '../models/Graph';
export default {
	name: 'roles',
	props: {
		context: {
			// type: Object,
			required: true
		},
	},
	data() {
		return {
			roles: [],
			relations: [],
			nbNodes: 0,
			nbRelations: 0
		}
	},	
	created: function() {

		this.showRoles()
		this.showRelationTypes()
	},
	methods: {

		render: function() {

			var graphEditor = this.context.getContext()['graphEditor'];
			var thegraph = graphEditor._graph;

			graphEditor.render();
			this.nbNodes = thegraph._nodes.length;
			this.nbRelations = thegraph._links.length;
		},
		toggleRole: function(role) {

			role.checked = !role.checked;

			var graphEditor = this.context.getContext()['graphEditor'];
			var thegraph = graphEditor._graph;

			// add  nodes for checked role
			if (role.checked) {

				let selectedRelations = this.relations.reduce((acc, curr) => {
					if (curr.checked) {
						return acc.concat(curr.relation)
					}
					return acc
				}, []);

				// reduce to selected roles
				let selectedRoles = this.roles.reduce((acc, curr) => {
					if (curr.checked) {
						return acc.concat(curr.role)
					}
					return acc
				}, []);

				if (selectedRelations.length === 0) {
					grdb.getGraphNodesByLabel([role.role], 500)
						.then(graph => {
							thegraph.addNodeSet(graph.nodes);
							this.render();
						})
				} else {
					grdb.getGraphByRelationship(selectedRoles, selectedRelations, 2500).then(graph => {
						thegraph.addNodeSet(graph.nodes);
						thegraph.addLinkSet(graph.links);
						this.render();
					});
				}			
			}
			// remove node for unchecked role
			else {
				thegraph.removeNodesByLabels([role.role]);
				this.render();
			}
		},
		toggleRelation: function(relation) {

			relation.checked = !relation.checked
			// reduce to selected relation
			var graphEditor = this.context.getContext()['graphEditor'];
			var thegraph = graphEditor._graph;

			/*if (relation.checked || 1) {*/
				let selectedRelations = this.relations.reduce((acc, curr) => {
					if (curr.checked) {
						return acc.concat(curr.relation)
					}
					return acc
				}, []);
				
				// reduce to selected roles
				let selectedRoles = this.roles.reduce((acc, curr) => {
					if (curr.checked) {
						return acc.concat(curr.role)
					}
					return acc
				}, []);

				grdb.getGraphByRelationship(selectedRoles, selectedRelations, 2500).then(graph => {
					thegraph.updateNodeSet(graph.nodes);
					thegraph.updateLinkSet(graph.links);
					this.render();
				});
				/*
			}
			else {
				thegraph.removeLinksByTypes([relation.relation]);
				this.render();
			}*/
		},
		showRoles: function() {

			return grdb.getNodeLabelsSet().then(roles => {

				var graphEditor = this.context.getContext()['graphEditor'];

				// Reset roles array
				this.roles.length = 0
				roles.forEach(role => {
					this.roles.push({
						role: role[0],
						checked: false
					})
				})
				// reduce roles to an array of first roles
				graphEditor.setNodesTypesSet(roles.reduce((acc, curr, []) => { 
					acc.push(curr[0]);
					return acc;
				}));
			})
		},
		showRelationTypes: function() {
			grdb.getRelationshipTypes().then(types => {
				if (!types) {
					return
				}

				this.relations.length = 0
				types.forEach(type => {
					this.relations.push({
						relation: type,
						checked: false
					})
				})
			})
		}
	}
}

</script>

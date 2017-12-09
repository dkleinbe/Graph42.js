<template>
<div class="roles">
  <v-container>
  	<p>{{nbNodes()}}</p>
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
		graphEditor: {
			// type: Object,
			required: true
		},
		graph: {
			required: true
		}
	},
	data() {
		return {
			roles: [],
			relations: [],
		}
	},	
	created: function() {

		this.showRoles()
		this.showRelationTypes()
	},
	methods: {
		nbNodes: function () { 
			return this.graph._nodes.length; 
		},
		toggleRole: function(role) {

			role.checked = !role.checked;

			if (role.checked) {
				grdb.getGraphNodesByLabel([role.role], 5)
					.then(graph => { 
						this.graph.addNodeSet(graph.nodes);
						this.graphEditor.render();

					})
			}
			else {
				grdb.getGraphNodesByLabel([role.role], 5)
					.then(graph => { 
						this.graph.removeNodeSet(graph.nodes);
						this.graphEditor.render();
		
					})
			}
			
			/* reduce to selected roles
			let selectedRoles = this.roles.reduce((acc, curr) => {
				if (curr.checked) {
					return acc.concat(curr.role)
				}
				return acc
			}, [])

			
			grdb.getGraphNodesByLabel(selectedRoles, selectedRoles.length * 5)
					.then(graph => { 
						this.graph.addNodeSet(graph.nodes);
						this.graphEditor.Render();
					})
	*/
		},
		toggleRelation: function(relation) {

			relation.checked = !relation.checked
			// reduce to selected relation
			let selectedRelations = this.relations.reduce((acc, curr) => {
				if (curr.checked) {
					return acc.concat(curr.relation)
				}
				return acc
			}, [])
			grdb.getGraphByRelationship(["Movie", "Person"], selectedRelations, 25).then(graph => {
				this.graph.addNodeSet(graph.nodes);
				this.graph.addLinkSet(graph.links);
				this.graphEditor.render();
			});
		},
		showRoles: function() {

			return grdb.getNodeLabelsSet().then(roles => {

				// Reset roles array
				this.roles.length = 0
				roles.forEach(role => {
					this.roles.push({
						role: role[0],
						checked: false
					})
				})
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

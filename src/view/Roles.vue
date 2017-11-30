<template>
<div class="roles">
  <v-container>
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
		}
	},
	data() {
		return {
			roles: [],
			relations: [],
			checked: {},
			dirty: false
		}
	},
	created: function() {

		this.showRoles()
		this.showRelationTypes()
	},
	methods: {
		toggleRole: function(role) {

			role.checked = !role.checked
			// reduce to selected roles
			let selectedRoles = this.roles.reduce((acc, curr) => {
				if (curr.checked) {
					return acc.concat(curr.role)
				}
				return acc
			}, [])

			
			grdb.getGraphNodesByLabel(selectedRoles, selectedRoles.length * 5)
					.then(graph => this.graphEditor.renderGraph(new Graph(graph.nodes, graph.links)))
		// this.dirty = !this.dirty;
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
					this.checked[role[0]] = false
				}, [])
			})
		},
		showRelationTypes: function() {
			grdb.getRelationshipTypes().then(types => {
				if (!types) {
					return
				}
				this.relations.length = 0
				types.forEach(type => {
					this.relations.push(type)
				})
			})
		}
	}
}

</script>

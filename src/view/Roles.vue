<template>
	<div class="roles">
		<table id="roles_" class="table table-striped table-hover">
			<thead>
				<tr>
					<th>Roles</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="role in roles"><td>{{role}}</td></tr>
			</tbody>
		</table>
	</div>
</template>
<script type="text/javascript">

import {grdb} from '../GraphDatabase';;

export default {
	name: 'roles',
	data() {
		return {
			roles:  [],
			relations: []
		}
	},
	created: function() {
		
		this.showRoles();
		this.showRelationTypes();
	},
	methods: {
		showRoles: function() {

			return grdb.getNodeLabelsSet().then(roles => { 
			
	          	// Reset roles array
	          	this.roles.length = 0;
				roles.forEach(role => { this.roles.push(role[0])}); 
	      });
		},
		showRelationTypes: function() {
			grdb.getRelationshipTypes().then(types => {
				if (!types)
					return;
				this.relations.length = 0;
				types.forEach(type => {
					this.relations.push(type);
				});
			});
		}
	}
}
</script>
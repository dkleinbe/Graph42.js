<template>
	<div class="item-properties">
		<!-- <span>{{context}} : {{context.touch}} selection: {{selection}}</span> -->
		<ul v-if="selection._nodeSelection != null">
			<v-container fluid class="px-3">
            	<v-layout row wrap>
            		<v-card>
            			<!--
            			<v-toolbar>
            				<v-toolbar-title>Selection properties</v-toolbar-title>
            			</v-toolbar>
            			-->
            			<v-card-text>
            				<span class="title">{{selection._nodeSelection.label}}</span>
								<form>
									<v-flex xs12 v-for="(value, propName, index) in selection._nodeSelection.properties" :key="index">
										<v-text-field 
											:name="propName"
											:label="propName"
											:value="value"
											:id="index"
											v-model="selection._nodeSelection.properties[propName]"
										></v-text-field>
									</v-flex>
									<v-btn @click="submitProperties">submit</v-btn>
								</form>
            			</v-card-text>
            		</v-card>
            	</v-layout>
            </v-container>
		</ul>
	</div>
</template>
<script type="text/javascript">
	import { grdb } from '../GraphDatabase';
	export default {
		name: "item-properties",
		props: {
			context: {
				type: Object,
				required: true,
				default: function() {
					return {}
				}
			}
		},
		data() {
			return {
				selection: { name: "toto", type: 'coucou' }
			}
		},
		methods: {
			render: function() {

				let graphEditor = this.context.getContext()['graphEditor'];

				graphEditor.updateNode();
			},
			submitProperties: function() {
				// this.render();

				let graphEditor = this.context.getContext()['graphEditor'];
				grdb.updateNode(graphEditor._selection._nodeSelection).then(result => {
					this.render();
				});
			}
		},
		watch: {
			"context.touch": function(oldVal, newVal) {
				console.log("CONTEXT CHANGED")
				let graphEditor = this.context.getContext()["graphEditor"];
	
				this.selection = graphEditor._selection;
	
			},
			"selection": {
				"handler": function(oldVal, newVal) {
					console.log("selection changed");
					// this.render();
				},
				deep: true
			}
		}
	}
</script>

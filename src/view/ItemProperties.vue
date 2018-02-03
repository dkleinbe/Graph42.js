<template>
	<div class="item-properties">
		<span>{{context}} : {{context.touch}} selection: {{selection}}</span>
		<ul v-if="selection._nodeSelection != null">
			<li v-for="(value, propName, index) in selection._nodeSelection.properties">
				{{propName}}: {{value}} [{{index}}]
			</li>
		</ul>
	</div>
</template>
<script type="text/javascript">
	export default {
		name: 'item-properties',
		props: {
			context: {
				type: Object,
				required: true,
				default: function() {
					return {}
				}
			},
		},		
		data() {
			return {
				selection: { name: "toto", type: 'coucou'}
			}
		},
		watch: {
			'context.touch': function (oldVal, newVal) {
				console.log('CONTEXT')
				let graphEditor = this.context.getContext()['graphEditor'];
				if (graphEditor._selection) {
					//this.selection = _.clone(graphEditor._nodeSelection.properties, true) ;
					this.selection = graphEditor._selection;
				}
				else {
					this.selection = {item: 'none'}
				}
				//this.selection = {name: 'bidule', touch: newVal}
			},
		}
	}
</script>
<template>
<v-app>
  <v-navigation-drawer persistent
					   :mini-variant="miniVariant"
					   clipped
					   dark
					   fixed
					   v-model="drawer"
					   enable-resize-watcher
					   app>
	<v-list>
	  <v-list-tile value="true"
				   v-for="(item, i) in items"
				   :key="i">
		<v-list-tile-action>
		  <v-icon v-html="item.icon"></v-icon>
		</v-list-tile-action>
		<v-list-tile-content>
		  <v-list-tile-title v-text="item.title"></v-list-tile-title>
		</v-list-tile-content>
	  </v-list-tile>
	  <roles :context="context"></roles>
	  <ItemProperties :context="context"></ItemProperties>
	</v-list>
  </v-navigation-drawer>
  <v-toolbar fixed
			 app
			 :clipped-left="clipped">
	<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
	<v-btn icon
		   @click.stop="miniVariant = !miniVariant">
	  <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
	</v-btn>
	<v-btn icon
		   @click.stop="clipped = !clipped">
	  <v-icon>web</v-icon>
	</v-btn>
	<v-btn icon
		   @click.stop="fixed = !fixed">
	  <v-icon>remove</v-icon>
	</v-btn>
	<v-toolbar-title v-text="title"></v-toolbar-title>
	<v-spacer></v-spacer>
	<v-btn icon
		   @click.stop="rightDrawer = !rightDrawer">
	  <v-icon>menu</v-icon>
	</v-btn>
  </v-toolbar>
  
	<v-content>
	  <v-container fluid
				   fill-height>
		<v-layout justify-center
				  align-center>
			<div id="canvas_">
		  	<div id="graph_"></div>
				
				<div id="divoverlay_">
					
					<div id="divWheel" data-wheelnav 
						data-wheelnav-wheelradius="50"
						data-wheelnav-navangle="90"
						data-wheelnav-slicepath="DonutSlice" 
						data-wheelnav-colors="#E34C26,#F06529" 
						data-wheelnav-rotateoff>
					</div>
					
				</div>
			
			</div>
		</v-layout>
	  </v-container>
	</v-content>
  
  <v-navigation-drawer temporary
					   right
					   fixed
					   dark
					   v-model="rightDrawer"
					   app>

	<v-expansion-panel v-if="loaded === true" popout expand>
	  <v-expansion-panel-content>
		<div slot="header">Center</div>
		<v-card class="e4">
		  <v-card-text>
			<v-slider label="X"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.center.x"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="Y"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.center.y"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                      
		  </v-card-text>
		</v-card>
	  </v-expansion-panel-content>
	  <v-expansion-panel-content>
		<div slot="header">Charge</div>
		<v-card class="e4">
		  <v-card-text>
			<v-checkbox label="enabled" 
						v-on:change="restartSimulation"
						v-model="forcesProperties.charge.enabled" 
						></v-checkbox>
			<v-slider label="strength"
					  v-bind:min="-200"
					  v-bind:max="40"
					  v-bind:step="1"
					  v-model="forcesProperties.charge.strength"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="distance min"
					  v-bind:min="0"
					  v-bind:max="2000"
					  v-bind:step="1"
					  v-model="forcesProperties.charge.distanceMin"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>    
			<v-slider label="distance max"
					  v-bind:min="0"
					  v-bind:max="2000"
					  v-bind:step="1"
					  v-model="forcesProperties.charge.distanceMax"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                                              
		  </v-card-text>
		</v-card>        
	  </v-expansion-panel-content>
	  <v-expansion-panel-content>
		<div slot="header">Collide</div>
		<v-card class="e4">
		  <v-card-text>
			<v-checkbox label="enabled" 
						v-on:change="restartSimulation"
						v-model="forcesProperties.collide.enabled" 
						></v-checkbox>            
			<v-slider label="strength"
					  v-bind:min="-0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.collide.strength"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="iterations"
					  v-bind:min="0"
					  v-bind:max="10"
					  v-bind:step="1"
					  v-model="forcesProperties.collide.iterations"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>    
			<v-slider label="radius"
					  v-bind:min="0"
					  v-bind:max="50"
					  v-bind:step="1"
					  v-model="forcesProperties.collide.radius"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                                              
		  </v-card-text>
		</v-card>        
	  </v-expansion-panel-content>   
	  <v-expansion-panel-content>
		<div slot="header">Link distance</div>
		<v-card class="e4">
		  <v-card-text>
			<v-checkbox label="enabled" 
						v-on:change="restartSimulation"
						v-model="forcesProperties.link.enabled" 
						></v-checkbox>                  
			<v-slider label="distance"
					  v-bind:min="0"
					  v-bind:max="1000"
					  v-bind:step="1"
					  v-model="forcesProperties.link.distance"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="iterations"
					  v-bind:min="0"
					  v-bind:max="20"
					  v-bind:step="1"
					  v-model="forcesProperties.link.iterations"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                                                 
		  </v-card-text>
		</v-card>        
	  </v-expansion-panel-content>          
	  <v-expansion-panel-content>
		<div slot="header">forceX</div>
		<v-card class="e4">
		  <v-card-text>
			<v-slider label="strength"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.forceX.strength"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="x"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.forceX.x"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                                                 
		  </v-card-text>
		</v-card>        
	  </v-expansion-panel-content>
	  <v-expansion-panel-content>
		<div slot="header">forceY</div>
		<v-card class="e4">
		  <v-card-text>
			<v-slider label="strength"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.forceY.strength"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>
			<v-slider label="x"
					  v-bind:min="0"
					  v-bind:max="1"
					  v-bind:step="0.01"
					  v-model="forcesProperties.forceY.x"
					  v-on:input="restartSimulation"
					  thumb-label></v-slider>                                                 
		  </v-card-text>
		</v-card>        
	  </v-expansion-panel-content>               
	</v-expansion-panel>
  </v-navigation-drawer>
  <v-footer :fixed="fixed"
			app>
	<span>&copy; 2017 </span>
	<v-progress-linear v-model="forceActivity"></v-progress-linear>
  </v-footer>
</v-app>

</template>

<script>

var api = require("./neo4jApi");
import { grdb } from "./GraphDatabase";
import { GraphEditor } from "./view/GraphEditor";
import { Graph } from "./models/Graph";
import Roles from "./view/Roles.vue";
import ItemProperties from "./view/ItemProperties.vue";

var theContext = {};

class Context {
	constructor() {
		this.touch = 0;
	}
	getContext() {
		return theContext;
	}
	addContextKeyValue(key, value) {
		theContext[key] = value;
		this.touch = this.touch + 1;
	}
}

var _context = new Context();

export default {
	components: {
		Roles,
		ItemProperties
	},
	data() {
		return {
			context: _context,
			clipped: false,
			drawer: true,
			fixed: false,
			items: [
				{
					icon: "bubble_chart",
					title: "Inspire"
				}
			],
			miniVariant: false,
			right: true,
			rightDrawer: false,
			title: "Graph42js",
			forceActivity: 0,
			red: 0,
			loaded: false,
			forcesProperties: {}
		};
	},
	methods: {
		restartSimulation: function() {
			if (this.loaded) {
				_context.getContext()["graphEditor"].restartSimulation();
			}
			this.context.touch = this.context.touch + 1;
		}
	},
	beforeCreate() {
		// this.graph = new Graph()
	},
	mounted() {
		// var grdb = new GraphDatabase();
		
		var svg = d3
			.select("#graph_")
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("pointer-events", "all");

		var graph = new Graph();

		var graphEditor = new GraphEditor(svg, graph);
		graphEditor.addTickListener(alpha => (this.forceActivity = alpha * 100));
		this.context.addContextKeyValue("graphEditor", graphEditor);

		this.forcesProperties = _context.getContext()["graphEditor"]._forces.forcesProperties;
		this.loaded = true;
		//grdb.connect();

		// TESTING STUFF TODO: Remove this
		grdb.getSchema().then(s => {
			console.log('schema ****')
			console.log(s)
			console.log("SCHEMA LABELS: ", grdb._schema.getNodeLabelsSet())
		});
		
/*
		grdb.getSchemaGraph().then(g => {
			graph.addNodeSet(g.nodes);
			graph.addLinkSet(g.links);
			graphEditor.render();
		});
		*/
	}
	
};
</script>

<style type="text/css">

#canvas_ {
	position: relative;
	height: 100%;
	width: 100%;
}
#graph_ {
	height: 100%;
	width: 100%;
}

#divoverlay_ {
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	z-index: 2;
	position: absolute;
	pointer-events: none;
}

#divWheel {
	height: 100px;
	width: 100px;
	left: 0;
	bottom: 0;
	position: absolute;
	pointer-events: auto;
}

#divWheel > svg {
	height: 100%;
	width: 100%;	
}

.overlay {
	opacity: 0.5;
}

.node {
	stroke: #222;
	stroke-width: 1.5px;
}

.node > text {
	stroke-width: 0px;
}

.p_node_text {
	pointer-events: none;
	text-align: center;
	vertical-align: middle;
}
.node_text {
	pointer-events: none;
	text-align: center;
	vertical-align: middle;
	display: inline-block;
	line-height: 1.2;
}
/*
.node>circle {
  fill: #888;
}

.node.new>circle {
  fill: #FF0;
}

.node.update>circle {
  fill: #F0F;
}
*/

.node.over > circle {
	fill: #f00;
}

.node.selected > circle {
	fill: #0f0;
}

.link {
	stroke: #999;
	stroke-opacity: 0.6;
	stroke-width: 2px;
	pointer-events: stroke;
}

.link.over {
	stroke-width: 4px;
}

.link.dragline.hidden {
	stroke-width: 0px;
}

.link.selected {
	stroke: #0f0;
}
</style>

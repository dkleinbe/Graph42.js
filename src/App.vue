<template>
<v-app>
  <v-navigation-drawer persistent
                       :mini-variant="miniVariant"
                       :clipped="clipped"
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
      <roles :graphEditor="graphEditor" :graph="graph"></roles>
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
  <main>
    <v-content>
      <v-container fluid
                   fill-height>
        <v-layout justify-center
                  align-center>
          <div id="graph_"></div>
        </v-layout>
      </v-container>
    </v-content>
  </main>
  <v-navigation-drawer temporary
                       :right="right"
                       v-model="rightDrawer"
                       app>
    <v-list>
      <v-list-tile @click.native="right = !right">
        <v-list-tile-action>
          <v-icon>compare_arrows</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
  <v-footer :fixed="fixed"
            app>
    <span>&copy; 2017 {{graph._nodes.length}}</span>
    <v-progress-linear v-model="forceActivity"></v-progress-linear>
  </v-footer>
</v-app>

</template>

<script>
var api = require('./neo4jApi')
import { grdb } from './GraphDatabase';
import { GraphEditor } from './view/GraphEditor';
import { Graph } from './models/Graph';
import Roles from './view/Roles.vue';
export default {
    components: {
        Roles
    },
    data() {
        return {
            clipped: false,
            drawer: true,
            fixed: false,
            items: [
                {
                    icon: 'bubble_chart',
                    title: 'Inspire'
                }
            ],
            miniVariant: false,
            right: true,
            rightDrawer: false,
            title: 'Graph42js',
            forceActivity: 0,
            graphEditor: Object,
        }
    },
    computed: {
        graph: function() {
            if (this._graph === undefined) {
                this._graph = new Graph();
            }
            
            return this._graph;
            
        }
    },
    beforeCreate() {
        //this.graph = new Graph()      
    },
    mounted() {
        // var grdb = new GraphDatabase();
        var svg = d3.select('#graph_').append('svg')
            .attr('width', '100%').attr('height', '100%')
            .attr('pointer-events', 'all')

        
        //this.graph = new Graph()
        this.graphEditor = new GraphEditor(svg, this.graph)

        this.graphEditor.addTickListener((alpha) => this.forceActivity = alpha * 100)

        grdb.connect()
        // api.getMovieGraph('The Matrix').then(graph => graphEditor.renderGraph(graph))
        /*
        grdb.getGraphNodesByLabel([
            'Movie',
            'Person'
        ], 100).then(graph => this.graphEditor.renderGraph(new Graph(graph.nodes, graph.links)))
        */
    }
}

</script>

<style type="text/css">
#graph_ {
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
.node.over>circle {
  fill: #F00;
}

.node.selected>circle {
  fill: #0F0;
}


.link {
  stroke: #999;
  stroke-opacity: .6;
  stroke-width: 2px;
}

.link.over {
  stroke-width: 4px;
}

.link.dragline.hidden {
  stroke-width: 0px;
}

.link.selected {
  stroke: #0F0;
}
</style>

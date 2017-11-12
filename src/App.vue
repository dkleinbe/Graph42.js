<template>
  <v-app>
    
    <v-toolbar fixed app :clipped-left="clipped">
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-content>
        <div id="graph_"></div>
      </v-content>
    </main>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  var api = require('./neo4jApi');
  import GraphDatabase from './GraphDatabase';
  import {GraphEditor} from './view/GraphEditor';
  export default {
    data () {
      return {
        clipped: false,
        drawer: true,
        fixed: false,
        items: [
          { icon: 'bubble_chart', title: 'Inspire' }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Graph42js'
      }
    },
    mounted() {
      var grdb = new GraphDatabase();
      var svg = d3.select("#graph_").append("svg")
        .attr("width", "100%").attr("height", "100%")
        .attr("pointer-events", "all");

      var graphEditor = new GraphEditor(svg);
      grdb.connect();
      api.getMovieGraph("The Matrix").then(graph => graphEditor.renderGraph(graph));
      
    }
  }
</script>
<style type="text/css">
    #graph_ { height: 100%; width: 100%; }
    .overlay { opacity: 0.5; }
    .node { stroke: #222; stroke-width: 1.5px; }
    .node.actor { fill: #888; }
    .node.movie { fill: #BBB; }
    .node.actor.update { fill: #FF0; }
    .node.movie.over {fill: #F00;}
    .node.actor.over {fill: #F00;}
    .node.movie.selected {fill: #0F0;}
    .node.actor.selected {fill: #0F0;}
    .link { stroke: #999; stroke-opacity: .6; stroke-width: 2px; }
    .link.over { stroke-width: 4px; }
    .link.dragline.hidden { stroke-width: 0px; }
    .link.selected {stroke: #0F0;}  
</style>

var api = require('./neo4jApi');
import GraphDatabase from './GraphDatabase';
import {GraphEditor} from './view/GraphEditor';
import Vue from 'vue'

var grdb = new GraphDatabase();
var svg = d3.select("#graph_").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

var graphEditor = new GraphEditor(svg);

$(function () { 

  grdb.connect();
  var vroles = new Vue({
    el: '#roles_',
    data: {
      roles:  [],
      relations: []
    },
    created() {
      this.showRoles();
      this.showRelationTypes();
    },
    methods: {
      showRoles: function() {
        
        return grdb.getNodeLabelsSet().then(roles => { 
          console.log(roles); 
          
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

  });  

  var vRelType = new Vue({
    el: '#rel_types_',
    data: {
      relations: []
    },
    created() {
      this.showRelationTypes();
    },
    methods: {
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
  });  
  //showLabelSet();
  //showRelationTypes();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});

function showLabelSet() {
  grdb.getNodeLabelsSet().then(labels => {
    if (!labels)
      return;

    var t = $("table#roles tbody").empty();
    labels.forEach(label => {
      $("<tr><td class='role'>" + label + "</td></tr>").appendTo(t);
    })
  });
  
}

function showRelationTypes() {
  grdb.getRelationshipTypes().then(types => {
    if (!types)
      return;
    var t = $("table#rel_types tbody").empty();
    types.forEach(type => {
      $("<tr><td class='role'>" + type + "</td></tr>").appendTo(t);
    })
  })
}

function showMovie(title) {
  api
    .getMovie(title)
    .then(movie => {
      if (!movie) return;

      //renderMovieGraph(title);
      newRenderGraph(title);

      $("#title").text(movie.title);
      $("#poster").attr("src", "http://neo4j-contrib.github.io/developer-resources/language-guides/assets/posters/" + movie.title + ".jpg");
      var $list = $("#crew").empty();
      movie.cast.forEach(cast => {
        $list.append($("<li>" + cast.name + " " + cast.job + (cast.job == "acted" ? " as " + cast.role : "") + "</li>"));
      });
    }, "json");
}

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchMovies(query)
    .then(movies => {
      var t = $("table#results tbody").empty();

      if (movies) {
        movies.forEach(movie => {
          $("<tr><td class='movie'>" + movie.title + "</td><td>" + movie.released + "</td><td>" + movie.tagline + "</td></tr>").appendTo(t)
            .click(function() {
              showMovie($(this).find("td.movie").text());
            })
        });

        var first = movies[0];
        if (first) {
          showMovie(first.title);
          //renderMovieGraph(first.title);
        }
      }
    });
}

function newRenderGraph(title) {

    api.getMovieGraph(title).then(graph => graphEditor.renderGraph(graph));
}


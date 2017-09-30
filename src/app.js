var api = require('./neo4jApi');
import GraphDatabase from './GraphDatabase';
import {GraphEditor} from './view/GraphEditor';

var grdb = new GraphDatabase();
var svg = d3.select("#graph_").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

var graphEditor = new GraphEditor(svg);

$(function () { 

  grdb.connect();
  showLabelSet();
  showRelationTypes();
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
    console.log(labels);
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


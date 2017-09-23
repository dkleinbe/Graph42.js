var api = require('./neo4jApi');
import GraphDatabase from './GraphDatabase';

var grdb = new GraphDatabase();

$(function () {
  //renderGraph();
  //renderMovieGraph("The Matrix");
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

      renderMovieGraph(title);
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

function renderGraph() {
  var width = 800, height = 800;
  var forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));
                                //.force.linkDistance(30)
                                //.force.size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      forceSim.nodes(graph.nodes);
      forceSim.force("link", d3.forceLink().links(graph.links));

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(d3.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      forceSim.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}

var width = 1500, height = 1000;
var forceSim = d3.forceSimulation().force("charge", d3.forceManyBody(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

function renderMovieGraph(title) {

  var gr = d3.select("#graph");
  var svg = gr.selectAll("svg").data(['svg']);

  svg.enter().append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  svg = gr.select("svg");

  api
    .getMovieGraph(title)
    .then(graph => {
      forceSim.nodes(graph.nodes);
      forceSim.force("link", d3.forceLink().links(graph.links));

      var link = svg.selectAll(".link")
        .data(graph.links);

      link.enter().append("line").attr("class", "link");

      link.exit().remove();

      var links = svg.selectAll(".link");

      var node = svg.selectAll(".node")
        .data(graph.nodes, d => { return d.title; });

      node.attr("class", d => { return "node " + d.label + " update" });

      node.enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
        .append("title")
          .text(d => {
            return d.title;
        });

      node.exit().remove();
      // html title attribute
      var nodes = svg.selectAll(".node");
      
      // force feed algo ticks
      forceSim.on("tick", () => {
        links.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        nodes.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
      //
      // restart simulation
      //
      forceSim = forceSim.alpha(1).restart();
    });

  function dragstarted(d) {
    if (!d3.event.active) forceSim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) forceSim.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }  
}

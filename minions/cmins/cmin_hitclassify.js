(function (_divId, _dataChannels) {
  var _dataChannel = (_dataChannels instanceof Array) ? _dataChannels[0] : _dataChannels;
  const MAX_BARS = 6;
  const D34_LIB_URL = "https://d3js.org/d3.v4.min.js";
  const UPDATE_CHART_INTERVAL = 60000;
  const TRANS_DURATION = 150;

  var is_doc_visible = true;

  var input_buffer = [];
  var current_hits = {};

  // global vars for SVG
  var x, y, svg, xAxis, yAxis, width, height;

  var initializeChart = function() {
    // Mike Bostock "margin conventions"
    var margin = {top: 20, right: 20, bottom: 30, left: 45};
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // D3 scales = just math
    // x is a function that transforms from "domain" (data) into "range" (usual pixels)
    // domain gets set after the data loads
    x = d34.scaleBand()
      .rangeRound([0, width]);

    y = d34.scaleLinear()
      .range([height, 0]);

    // D3 Axis - renders a d3 scale in SVG
    xAxis = d34.axisBottom(x);

    yAxis = d34.axisLeft(y)
      .ticks(5);

    // create an SVG element (appended to body)
    // set size
    // add a "g" element (think "group")
    // annoying d3 gotcha - the 'svg' variable here is a 'g' element
    // the final line sets the transform on <g>, not on <svg>
    svg = d34.select('#' + _divId)
    .append("div")
      .classed("svg-container", true)
    .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
      .attr("viewBox", "0 0 960 500") // resizing responsive
      .classed("svg-content-responsive", true)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")

    svg.append("g")
        .attr("class", "y axis")
      .append("text") // just for the title (ticks are automatic)
        .attr("transform", "rotate(-90)") // rotate the text!
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("hits");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Hits");

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Iterations");
  }

  function type(d) {
    // + coerces to a Number from a String (or anything)
    d.damaging = +d.damaging;
    d.normal = +d.normal;
    d.soft = +d.soft;
    return d;
  }

  function resetHits() {
    // reset current_hits
    current_hits["soft"] = 0;
    current_hits["normal"] = 0;
    current_hits["damaging"] = 0;
  }

  function onHitsReceived(hits) {
    classifyHits(current_hits, parseInt(hits.value));
    updateChart(current_hits, false);
  }

  function classifyHits(current_hits, hits) {
    if (hits >= 1 && hits < 11) {
      current_hits["soft"]++;
    } else if (hits >= 11 && hits <= 30) {
      current_hits["normal"]++;
    } else if (hits > 30) {
      current_hits["damaging"]++;
    }
  }

  var count = 0;
  // updates the bar chart with the current hits data
  // bool: new_iteration: if true, a new iteration will be pushed to chart
  // otherwise, update the current iteration in place
  function updateChart(data, new_iteration) {
    // create a deep copy as objects are passed by reference
    var data_copy = Object.assign({}, data);

    if(new_iteration) {
      data_copy["iteration"] = count;
      count++;
    }
    else {
      // set iteration to the previous one
      data_copy["iteration"] = count - 1;
    }

    if(new_iteration) {
      // push data point to input queue
      if(input_buffer.length == MAX_BARS) {
        // remove first element
        input_buffer.shift();
      }
      input_buffer.push(data_copy);
    }
    else {
      // replace last element of input_buffer i.e. update the last iteration
      input_buffer.pop();
      input_buffer.push(data_copy);
    }

    if(is_doc_visible) {
      draw(input_buffer);
    }
  }

  function draw(data) {
    // measure the domain (for x, unique letters) (for y [0,maxFrequency])
    // now the scales are finished and usable
    x.domain(data.map(function(d) { return d.iteration; }));
    y.domain([0, d34.max(data, function(d) { return Math.max(+d.damaging, +d.normal, +d.soft); })]);

    // another g element, this time to move the origin to the bottom of the svg element
    // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
    //   for everything in the selection\
    // the end result is g populated with text and lines!
    svg.select('.x.axis').transition().duration(TRANS_DURATION).call(xAxis);

    // same for yAxis but with more transform and a title
    svg.select(".y.axis").transition().duration(TRANS_DURATION).call(yAxis);

    // THIS IS THE ACTUAL WORK!
    // types of hits
    var damaging = svg.selectAll(".damaging").data(data, function(d) { return d.iteration; });
    var normal = svg.selectAll(".normal").data(data, function(d) { return d.iteration; });
    var soft = svg.selectAll(".soft").data(data, function(d) { return d.iteration; });

    damaging.exit()
      .transition()
        .duration(TRANS_DURATION)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();
    normal.exit()
      .transition()
        .duration(TRANS_DURATION)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();
    soft.exit()
      .transition()
        .duration(TRANS_DURATION)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();

    // data that needs DOM = enter() (a set/selection, not an event!)
    damaging.enter().append("rect")
        .attr("class", "damaging")
        .attr("y", y(0))
        .attr("height", height - y(0))
      .merge(damaging) // ENTER + UPDATE. // (d) is one item from the data array, x is the scale object from above
        .transition().duration(TRANS_DURATION).attr("x", function(d) { return x(d.iteration); })
        // constant, so no callback function(d) here
        .attr("width", x.bandwidth()/3.5)
        .attr("y", function(d) { return y(d.damaging); })
        // flip the height, because y's domain is bottom up, but SVG renders top down
        .attr("height", function(d) { return height - y(d.damaging); });
    normal.enter().append("rect")
        .attr("class", "normal")
        .attr("y", y(0))
        .attr("height", height - y(0))
      .merge(normal)
        .transition().duration(TRANS_DURATION).attr("x", function(d) { return x(d.iteration) + x.bandwidth()/3.5; })
        .attr("width", x.bandwidth()/3.5)
        .attr("y", function(d) { return y(d.normal); })
        .attr("height", function(d) { return height - y(d.normal); });
    soft.enter().append("rect")
        .attr("class", "soft")
        .attr("y", y(0))
        .attr("height", height - y(0))
      .merge(soft)
        .transition().duration(TRANS_DURATION).attr("x", function(d) { return x(d.iteration) + (x.bandwidth()*2/3.5); })
        .attr("width", x.bandwidth()/3.5)
        .attr("y", function(d) { return y(d.soft); })
        .attr("height", function(d) { return height - y(d.soft); });
  }

  /**
	 * Loads required libs dynamically
	 * @done: is the function to be called when loading is done, it takes a
   * boolean which value is true if the library was loaded successfully.
	 */
  function loadLibs(done) {
    if (typeof d34 === 'undefined') {
      $.getScript(D34_LIB_URL, function(data, textStatus, jqxhr) {
        d34 = window.d3;
        window.d3 = null;
        console.log("just loaded!", d34.version);
        done(textStatus === 'success');
      });
    } else {
        console.log(d34.version, ' is already loaded');
        done(true);
    }
  }

  function addStyles() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      .damaging {
        fill: red;
      }
      .normal {
        fill: yellow;
      }
      .soft {
        fill: green;
      }

      .axis {
        font: 12px sans-serif;
      }

      .axis path,
      .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
      }

     .svg-container {
       display: inline-block;
       position: relative;
       width: 100%;
       padding-bottom: 60%;
       /* aspect ratio */
       vertical-align: top;
       overflow: hidden;
     }

 		 .svg-content-responsive {
       display: inline-block;
       position: absolute;
       top: 10px;
       left: 0;
     }

     ul {
         list-style: none;
     }


    li {
       padding-left: 1em;
       text-indent: -.7em;
       font-size:16px;
    }

    li:before {
      content: "• ";
      font-size:25px;
    }

    li#damaging_ind:before {
       color: red;
    }
    li#normal_ind:before {
       color: yellow;
    }
    li#soft_ind:before {
       color: green;
    }
    `;

    document.getElementsByTagName('head')[0].appendChild(style);
  }

  function prepareDiv() {
    var div = document.getElementById(_divId);

    var box_string = "nbsp;nbsp;nbsp;nbsp;";

    var hits_indicator_list = document.createElement("ul");
    var damaging_indicator = document.createElement("li");
    var normal_indicator = document.createElement("li");
    var soft_indicator = document.createElement("li");

    damaging_indicator.setAttribute("id", "damaging_ind");
    normal_indicator.setAttribute("id", "normal_ind");
    soft_indicator.setAttribute("id", "soft_ind");

    damaging_indicator.textContent = "Damaging hits";
    normal_indicator.textContent = "Normal hits";
    soft_indicator.textContent = "Soft hits";

    hits_indicator_list.appendChild(damaging_indicator);
    hits_indicator_list.appendChild(normal_indicator);
    hits_indicator_list.appendChild(soft_indicator);
    div.appendChild(hits_indicator_list);
  }

  var callbackFunction = function(success) {
    if (success) {
      addStyles();
      clearDiv();
      initializeChart();
      prepareDiv();
      resetHits();
      startApp();
      updateChart(current_hits, true);
    } else {
      console.log("no libs are loaded!");
    }
  };

  function clearDiv() {
    var div = document.getElementById(_divId);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    div.style.width = '100%';

    if (_dataChannel) {
      _dataChannel.removeEventListener('Hit Classification');
    }
  }

  var startApp = function() {
    if(_dataChannel) {
      _dataChannel.addEventListener('add', onHitsReceived, 'Hit Classification');
    }
  }

  // load libs
  if (!('d3' in window)) {
    loadLibs(D3_LIB_URL, callbackFunction);
  } else {
    callbackFunction(true);
  }

  setInterval(function () {
    resetHits();

    updateChart(current_hits, true);
  }, UPDATE_CHART_INTERVAL);

  // for performace: if the tab/window is hidden, we want to stop the d3
  // chart from updating. when it becomes visible again, start updating the
  // chart
  document.onvisibilitychange = function(event) {
    if(document.hidden) {
      is_doc_visible = false;
    }
    else {
      is_doc_visible = true;
    }
  }
});

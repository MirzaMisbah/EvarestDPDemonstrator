/*this minion visualizes the financial forecast of potato prices. It takes as input the predicted prices of
  upcoming 3 months and visualizes them on a chart.
  Sample input:
  var sample_input = {
      "month1": {
          "min":12,
          "avg":15,
          "max":18
      },
      "month2": {
          "min":5,
          "avg":8,
          "max":12
      },
      "month3": {
          "min":25,
          "avg":28,
          "max":30
      }
  };
*/

/**
 * This file contains a template for the implementation of a visualization minion for financial forecast.
 * @namespace FinancialForecastVisualization
 */

(function (divId, inputDataChannels) {
    'use strict';
    /**
     * Defines all necessary data of a minion
     * @memberOf FinancialForecastVisualization
     * @type {Object}
     */
    const minionObject = {
        /* Define all libraries and dependencies of your current minion here, name is the name of the attached object to window,
        uir the ressource uri and source is the default name of the loaded library object. */
        dependencies : [
                {"name": "d34", "uri": "https://d3js.org/d3.v4.min.js", source : "d3"}
            ],

        // Initialization of a container
        div : document.getElementById(divId),

        MONTHS : ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"],
        NUM_OF_MONTHS : 3,

        svg : 0, xAxis : 0, yAxis : 0, xScale : 0, yScale : 0,
    };

    function initializeChart() {
        var margin = {top: 20, right: 20, bottom: 45, left: 85};
        var width = 960 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        // set x-axis domain
        var cur_month = getCurrentMonth();
        minionObject.xScale = d34.scaleBand()
            .rangeRound([0, width])
            .domain([minionObject.MONTHS[cur_month+1], minionObject.MONTHS[cur_month+2], minionObject.MONTHS[cur_month+3]]);

        minionObject.yScale = d34.scaleLinear()
            .rangeRound([height, 0]);

        minionObject.xAxis = d34.axisBottom(minionObject.xScale);

        minionObject.yAxis = d34.axisLeft(minionObject.yScale)
          .ticks(10);

        minionObject.svg = d34.select('#' + divId)
        .append("div")
          .classed("svg-container", true)
        .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
          .attr("viewBox", "0 0 960 500") // resizing responsive
          .classed("svg-content-responsive", true)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        minionObject.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");
        minionObject.svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                                 (height + 35) + ")")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Upcoming months");

        minionObject.svg.append("g")
              .attr("class", "y axis");
        minionObject.svg.append("text")
              .attr("x", -55)
              .attr("y", height/2)
              .style("font-weight", "bold")
              .style("font-size", "25px")
              .text("€");

        //display axes
        minionObject.svg.select('.x.axis').call(minionObject.xAxis);
        minionObject.svg.select(".y.axis").call(minionObject.yAxis);
    }

    function prepareDiv() {
        var div = document.getElementById(divId);

        var indicator_list = document.createElement("ul");
        var avg_indicator = document.createElement("li");
        var highest_indicator = document.createElement("li");
        var lowest_indicator = document.createElement("li");

        avg_indicator.setAttribute("id", "avg_ind");
        highest_indicator.setAttribute("id", "highest_ind");
        lowest_indicator.setAttribute("id", "lowest_ind");

        avg_indicator.textContent = "Average price";
        highest_indicator.textContent = "Month with highest average price";
        lowest_indicator.textContent = "Month with lowest average price";

        indicator_list.appendChild(avg_indicator);
        indicator_list.appendChild(highest_indicator);
        indicator_list.appendChild(lowest_indicator);
        div.appendChild(indicator_list);
    }

    function getCurrentMonth() {
        var date = new Date();
        var month = date.getMonth();

        return month;
    }

    function transformInputDataForFinancialForecastVisualization(input) {
        var output = {};
        for (var i = 0; i < input.value.mean.length; i++) {
            if (!output['month' + (i+1)]) {
                output['month' + (i+1)] = {};
            }
            output['month' + (i+1)].avg = input.value.mean[i];
            output['month' + (i+1)].min = input.value.lower_bound[i];
            output['month' + (i+1)].max = input.value.upper_bound[i];
        }



        return output;
    }

    function updateChart(input_data) {
        var input_data = transformInputDataForFinancialForecastVisualization(input_data);
        const LINE_LENGTH = 3;
        const CIRCLE_RADIUS = 9;
        const TEXT_OFFSET = 25;
        const TEXT_SIZE = 10;

        // remove previously drawn chart
        d34.selectAll("line").remove();
        d34.selectAll("circle").remove();
        d34.selectAll(".graph_text").remove();

        // only used to scale the y-axis
        var prices = [];
        var i;
        for(i=1; i<=minionObject.NUM_OF_MONTHS; i++) {
            prices.push(input_data["month"+i].avg);
            prices.push(input_data["month"+i].min);
            prices.push(input_data["month"+i].max);
        }

        minionObject.yScale.domain([0, d34.max(prices)]);
        minionObject.svg.select(".y.axis").call(minionObject.yAxis);

        // calculate which months have the highest and lowest avgs
        var min_avg = 65535;
        var max_avg = -1;
        for(i=1; i<=minionObject.NUM_OF_MONTHS; i++) {
            var avg = input_data["month"+i].avg;

            if(max_avg < avg) {
                max_avg = avg;
            }

            if(min_avg > avg) {
                min_avg = avg;
            }
        }

        var start_pos_x = minionObject.xScale.bandwidth()/2;
        var offset = 1;
        for(i=1; i<=minionObject.NUM_OF_MONTHS; i++) {
            // for displaying avg
            var color = "black";
            if(input_data["month"+i].avg == min_avg) {
                color = "#f44336";
            }
            else if(input_data["month"+i].avg == max_avg) {
                color = "#76ff03";
            }

            minionObject.svg.append("circle")
                .attr("cx", start_pos_x)
                .attr("cy", minionObject.yScale(input_data["month"+i].avg))
                .attr("r", CIRCLE_RADIUS)
                .attr("fill", color);
            minionObject.svg.append("text")
                .attr("x", start_pos_x-TEXT_OFFSET)
                .attr("y", minionObject.yScale(input_data["month"+i].avg))
                .attr("font-size", TEXT_SIZE)
                .text(input_data["month"+i].avg)
                .attr("class", "graph_text");

            // for displaying dotted line between max and min
            minionObject.svg.append("line")
                .attr("x1", start_pos_x)
                .attr("y1", minionObject.yScale(input_data["month"+i].max))
                .attr("x2", start_pos_x)
                .attr("y2", minionObject.yScale(input_data["month"+i].min))
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .attr("stroke-dasharray", 4);

            // for displaying max
            minionObject.svg.append("line")
                .attr("x1", start_pos_x-LINE_LENGTH)
                .attr("y1", minionObject.yScale(input_data["month"+i].max))
                .attr("x2", start_pos_x+LINE_LENGTH)
                .attr("y2", minionObject.yScale(input_data["month"+i].max))
                .attr("stroke-width", 1)
                .attr("stroke", "black");
            minionObject.svg.append("text")
                .attr("x", start_pos_x-TEXT_OFFSET)
                .attr("y", minionObject.yScale(input_data["month"+i].max))
                .attr("font-size", TEXT_SIZE)
                .text(input_data["month"+i].max)
                .attr("class", "graph_text");

            // for displaying min
            minionObject.svg.append("line")
                .attr("x1", start_pos_x-LINE_LENGTH)
                .attr("y1", minionObject.yScale(input_data["month"+i].min))
                .attr("x2", start_pos_x+LINE_LENGTH)
                .attr("y2", minionObject.yScale(input_data["month"+i].min))
                .attr("stroke-width", 1)
                .attr("stroke", "black");
            minionObject.svg.append("text")
                .attr("x", start_pos_x-TEXT_OFFSET)
                .attr("y", minionObject.yScale(input_data["month"+i].min))
                .attr("font-size", TEXT_SIZE)
                .text(input_data["month"+i].min)
                .attr("class", "graph_text");

            // we only want to draw NUM_OF_MONTHS-1 lines
            if(i != minionObject.NUM_OF_MONTHS) {
                minionObject.svg.append("line")
                    .attr("x1", start_pos_x)
                    .attr("y1", minionObject.yScale(input_data["month"+i].avg))
                    .attr("x2", start_pos_x + minionObject.xScale.bandwidth())
                    .attr("y2", minionObject.yScale(input_data["month"+(i+1)].avg))
                    .attr("stroke-width", 2)
                    .attr("stroke", "black");
            }

            start_pos_x += minionObject.xScale.bandwidth();
        }
    }

    /**
     * Starts the main application.
     * @inner
     * @memberOf FinancialForecastVisualization
     */
    function startApp() {
        inputDataChannels.forEach(function (dataChannel) {
            if (dataChannel) {
                updateChart(dataChannel.values[dataChannel.values.length-1]);
                // dataChannel.removeEventListener(divId);
                // dataChannel.addEventListener('add', newValue, divId);
            }
        });
    }

    /**
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf FinancialForecastVisualization
     */
    function clearMinionEnvironment() {

        // Clear the frontend
        while (minionObject.div.firstChild) {
            minionObject.div.removeChild(minionObject.div.firstChild);
        }
        minionObject.div.style.width = '100%';
    }

    /**
     * Creates the required style classes and appends them to the document head
     * @inner
     * @memberOf FinancialForecastVisualization
     */
    function addStyles() {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
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
             margin: auto;
             width: 80%;
         }


        li {
           padding-left: 1em;
           text-indent: -.7em;
           font-size: 16px;
           display: inline;
        }

        li:before {
          content: "• ";
          font-size:60px;
        }

        li#avg_ind:before {
           color: grey;
        }
        li#highest_ind:before {
           color: #76ff03;
        }
        li#lowest_ind:before {
           color: #f44336;
        }
        `;

        document.getElementsByTagName('head')[0].appendChild(style);
    }

    var sample_input = {
        "month1": {
            "min":12,
            "avg":15,
            "max":18
        },
        "month2": {
            "min":5,
            "avg":8,
            "max":12
        },
        "month3": {
            "min":25,
            "avg":28,
            "max":30
        }
    };
    // Start the functionality of the minion
    if (checkStarted()){
        loadDependencies(function(success) {
            if (success) {
                clearMinionEnvironment();
                addStyles();
                initializeChart();
                prepareDiv();
                startApp();
            } else {
                console.log("no libs are loaded!");
            }
        }, minionObject.dependencies);
    } else {
        clearMinionEnvironment();
    }

    /**
     * Loads required libs dynamically
     * @inner
     * @memberOf FinancialForecastVisualization
     * @param {function} callback The function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
     */
     function loadDependencies (callback, dependencies=minionObject.dependencies){
         if (dependencies.length > 0) {
             var dependency = dependencies.pop();
             if (!(dependency.name in window)) {
                 var scriptTag = document.createElement('script');
                 scriptTag.src = dependency.uri;
                 var cb = function(){
                   window[dependency.name] = window[dependency.source];
                   window[dependency.source] = null;
                   loadDependencies(callback, dependencies);
                 };
                 scriptTag.onload = cb;
                 scriptTag.onreadystatechange = cb;
                 document.querySelector('body').appendChild(scriptTag);
             } else {
                 loadDependencies(callback, dependencies);
             }
         } else {
             var cb = function(success) {
                 callback(success);
             };
             cb(true);
         }
     }

    /**
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf FinancialForecastVisualization
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }
});

/**
 * This function creates a Box & Whisker Plot of the given data
 * @divId: the id of the div to display the plot
 * @_data: the heart rate values in a day
 *
 * This code is based on the following :
 * https://bl.ocks.org/mbostock/4061502
 * http://bl.ocks.org/jensgrubert/7789216
 */
(function(divId, inputDataChannels) {
	//'use strict';
	const d33_LIB_URL = "https://d3js.org/d3.v3.min.js";	
	
	var _data = (inputDataChannels instanceof Array) ? inputDataChannels[0] : inputDataChannels; // inputDataChannel[0]
	
	// "https://d33js.org/d33.v3.min.js";

	
	loadlibs(function(success) {
		if (_data && success) {
			addStyles();
			prepareDiv();
			plotBoxes();
		} else {
			console.log("no data found or no libs are loaded!");
		}
	});

	function plotBoxes() {
		var min = Infinity,
		    max = -Infinity;
		    
		var groupByDays = true;
		    
		var svgTitle = "Data Distribution";
		var svgYAxisTitle = "Sensor Value";
		var svgXAxisTitle = groupByDays? "Dimension": "Hours";    // TODO: should be changed to something generic
		    
		var labels = true;

		var margin = {
			top : 30,
			right : 50,
			bottom : 70,
			left : 50
		};
		var width = 800 - margin.left - margin.right;
		var height = 400 - margin.top - margin.bottom;
		var data = [];
    

		
		var groups = groupInDays(_data.values);


		var result = groups[0];
		// values
		var hours = groups[1];
		// hour groups

		// Inspired by http://informationandvisualization.de/blog/box-plot
		d33.box = function() {
			var width = 1,
			    height = 1,
			    duration = 0,
			    domain = null,
			    value =
			    Number,
			    whiskers =
			    boxWhiskers,
			    quartiles =
			    boxQuartiles,
			    showLabels = true,
			    numBars = 23,
			    curBar = 1,
			    tickFormat = null;

			// For each small multiple…
			function box(g) {
				g.each(function(d, i) {						
					// we remove the hour from the data by slicing the array. this is important, otherwise, it will mess up the calculations!
					var d = d.slice(1).map(value).sort(d33.ascending);
					
					var g = d33.select(this),
					    n = d.length,
					    min = d[0],
					    max = d[n - 1];

					// Compute quartiles. Must return exactly 3 elements.
					var quartileData = d.quartiles = quartiles(d);

					// Compute whiskers. Must return exactly 2 elements, or null.
					var whiskerIndices = whiskers && whiskers.call(this, d, i),
					    whiskerData = whiskerIndices && whiskerIndices.map(function(i) {
						return d[i];
					});

					// Compute outliers. If no whiskers are specified, all data are "outliers".
					// We compute the outliers as indices, so that we can join across transitions!
					var outlierIndices = whiskerIndices ? d33.range(0, whiskerIndices[0]).concat(d33.range(whiskerIndices[1] + 1, n)) : d33.range(n);

					// Compute the new x-scale.
					var x1 = d33.scale.linear().domain(domain && domain.call(this, d, i) || [min, max]).range([height, 0]);

					// Retrieve the old x-scale, if this is an update.
					var x0 = this.__chart__ || d33.scale.linear().domain([0, Infinity]).range(x1.range());

					// Stash the new scale.
					this.__chart__ = x1;

					// Note: the box, median, and box tick elements are fixed in number,
					// so we only have to handle enter and update. In contrast, the outliers
					// and other elements are variable, so we need to exit them! Variable
					// elements also fade in and out.

					// Update center line: the vertical line spanning the whiskers.
					var center = g.selectAll("line.center").data( whiskerData ? [whiskerData] : []);

					center.enter().insert("line", "rect").attr("class", "center").attr("x1", width / 2).attr("y1", function(d) {
						return x0(d[0]);
					}).attr("x2", width / 2).attr("y2", function(d) {
						return x0(d[1]);
					}).style("opacity", 1e-6).transition().duration(duration).style("opacity", 1).attr("y1", function(d) {
						return x1(d[0]);
					}).attr("y2", function(d) {
						return x1(d[1]);
					});

					center.transition().duration(duration).style("opacity", 1).attr("y1", function(d) {
						return x1(d[0]);
					}).attr("y2", function(d) {
						return x1(d[1]);
					});

					center.exit().transition().duration(duration).style("opacity", 1e-6).attr("y1", function(d) {
						return x1(d[0]);
					}).attr("y2", function(d) {
						return x1(d[1]);
					}).remove();

					// Update innerquartile box.
					var box = g.selectAll("rect.box").data([quartileData]);

					box.enter().append("rect").attr("class", "box").attr("x", 0).attr("y", function(d) {
						return x0(d[2]);
					}).attr("width", width).attr("height", function(d) {
						return x0(d[0]) - x0(d[2]);
					}).transition().duration(duration).attr("y", function(d) {
						return x1(d[2]);
					}).attr("height", function(d) {
						return x1(d[0]) - x1(d[2]);
					});

					box.transition().duration(duration).attr("y", function(d) {
						return x1(d[2]);
					}).attr("height", function(d) {
						return x1(d[0]) - x1(d[2]);
					});

					// Update median line.
					var medianLine = g.selectAll("line.median").data([quartileData[1]]);

					medianLine.enter().append("line").attr("class", "median").attr("x1", 0).attr("y1", x0)
					.attr("x2", width).attr("y2", x0).transition().duration(duration).attr("y1", x1).attr("y2", x1);

					medianLine.transition().duration(duration).attr("y1", x1).attr("y2", x1);

					// Update whiskers.
					var whisker = g.selectAll("line.whisker").data(whiskerData || []);

					whisker.enter().insert("line", "circle, text").attr("class", "whisker").attr("x1", 0).attr("y1", x0).attr("x2", width).attr("y2", x0).style("opacity", 1e-6).transition().duration(duration).attr("y1", x1).attr("y2", x1).style("opacity", 1);

					whisker.transition().duration(duration).attr("y1", x1).attr("y2", x1).style("opacity", 1);

					whisker.exit().transition().duration(duration).attr("y1", x1).attr("y2", x1).style("opacity", 1e-6).remove();

					// Update outliers.
					var outlier = g.selectAll("circle.outlier").data(outlierIndices, Number);

					outlier.enter().insert("circle", "text").attr("class", "outlier").attr("r", 5).attr("cx", width / 2).attr("cy", function(i) {
						return x0(d[i]);
					}).style("opacity", 1e-6).transition().duration(duration).attr("cy", function(i) {
						return x1(d[i]);
					}).style("opacity", 1);

					outlier.transition().duration(duration).attr("cy", function(i) {
						return x1(d[i]);
					}).style("opacity", 1);

					outlier.exit().transition().duration(duration).attr("cy", function(i) {
						return x1(d[i]);
					}).style("opacity", 1e-6).remove();

					// Compute the tick format.
					var format = tickFormat || x1.tickFormat(8);

					// Update box ticks.
					var boxTick = g.selectAll("text.box").data(quartileData);

					boxTick.enter().append("text").attr("class", "box").attr("dy", ".3em").attr("dx", function(d, i) {
						return i & 1 ? 6 : -6;
					}).attr("x", function(d, i) {
						return i & 1 ? width : 0;
					}).attr("y", x0).attr("text-anchor", function(d, i) {
						return i & 1 ? "start" : "end";
					}).text(format).transition().duration(duration).attr("y", x1);

					boxTick.transition().duration(duration).text(format).attr("y", x1);

					// Update whisker ticks. These are handled separately from the box
					// ticks because they may or may not exist, and we want don't want
					// to join box ticks pre-transition with whisker ticks post-.
					var whiskerTick = g.selectAll("text.whisker").data(whiskerData || []);

					if (showLabels) {
						whiskerTick.enter().append("text").attr("class", "whisker").attr("dy", ".3em").attr("dx", 6).attr("x", width).attr("y", x0).text(format).style("opacity", 1e-6).transition().duration(duration).attr("y", x1).style("opacity", 1);
					}
					whiskerTick.transition().duration(duration).text(format).attr("y", x1).style("opacity", 1);

					whiskerTick.exit().transition().duration(duration).attr("y", x1).style("opacity", 1e-6).remove();
				});
				d33.timer.flush();
			};// box

			box.width = function(x) {
				if (!arguments.length)
					return width;
				width = x;
				return box;
			};

			box.height = function(x) {
				if (!arguments.length)
					return height;
				height = x;
				return box;
			};

			box.tickFormat = function(x) {
				if (!arguments.length)
					return tickFormat;
				tickFormat = x;
				return box;
			};

			box.duration = function(x) {
				if (!arguments.length)
					return duration;
				duration = x;
				return box;
			};

			box.domain = function(x) {
				if (!arguments.length)
					return domain;
				domain = x == null ? x : d33.functor(x);
				return box;
			};

			box.value = function(x) {
				if (!arguments.length)
					return value;
				value = x;
				return box;
			};

			box.whiskers = function(x) {
				if (!arguments.length)
					return whiskers;
				whiskers = x;
				return box;
			};

			box.showLabels = function(x) {
				if (!arguments.length)
					return showLabels;
				showLabels = x;
				return box;
			};

			box.quartiles = function(x) {
				if (!arguments.length)
					return quartiles;
				quartiles = x;
				return box;
			};

			return box;
		};

		// constructing data	
		result.forEach(function(x) {
			var hrIndex = Math.floor(x[0]);// hour index			
			var val = Math.floor(x[1]); // value
			// heart rate
			var d = data[hrIndex];

			if (!d) {
				d = data[hrIndex] = [hours[hrIndex], val]; // appending hour value at a the beginning of the array							
			} else {
				d.push(val);
			}
			if (val > max) {
				max = val;
			}
			if (val < min) {
				min = val;
			}
		});

		/******************************************************************************************************************************/
		var chart = d33.box().whiskers(iqr(1.5)).height(height).domain([min, max]).showLabels(labels);

		var svg = d33.select('#' + divId)
			.append("div")
			.classed("svg-container", true)
			.append("svg")			
			.attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
			.attr("viewBox", "0 0 800 400") // resizing responsive
			.classed("box", true)
			.append("g")			
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
		/******************************************************************************************************************************/	

		// X-axis		
		var x = d33.scale.ordinal().domain(data.map(function(d) {
			return d[0];			 // maping the x-axis to the hours which is stored at index 0
		})).rangeRoundBands([0, width], 0.7, 0.3);
		var xAxis = d33.svg.axis().scale(x).orient("bottom");
		
		var y = d33.scale.linear().domain([min, max]).range([height + margin.top, 0 + margin.top]);// maping the y-axis to the max and min of values
		var yAxis = d33.svg.axis().scale(y).orient("left");

		// draw the boxplots		
		svg.selectAll(".box").data(data).enter().append("g").attr("transform", function(d) {
			return "translate(" + x(d[0]) + "," + margin.top + ")";			
		}).call(chart.width(x.rangeBand()));
		

		/******************************************************************************************************************************/
		// add a title		
		svg.append("text").attr("x", (width / 2)).attr("y", 0 + (margin.top / 2)).attr("text-anchor", "middle").style("font-size", "14px")		
		.text(svgTitle);

		// draw y axis
		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
		.attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").style("font-size", "12px").text(svgYAxisTitle);

		// draw x axis
		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height + margin.top + 10) + ")").call(xAxis).append("text")
		.attr("x", (width / 2)).attr("y", 20).attr("dy", ".71em").style("text-anchor", "middle").style("font-size", "12px")		
		.text(svgXAxisTitle);

	}

	// Returns a function to compute the interquartile range. (IQR)
	function iqr(k) {
		return function(d, i) {
			var q1 = d.quartiles[0],
			    q3 = d.quartiles[2],
			    iqr = (q3 - q1) * k,
			    i = -1,
			    j = d.length;
			while (d[++i] < q1 - iqr);
			while (d[--j] > q3 + iqr);
			return [i, j];
		};
	}

	function boxWhiskers(d) {
		return [0, d.length - 1];
	}

	function boxQuartiles(d) {
		return [d33.quantile(d, .25), d33.quantile(d, .5), d33.quantile(d, .75)];
	}

	/**
	 * Creates an array of arries [23, n] each hour of the day will have an array that contains all heart bear values registered for that hour in hrVals
	 * @result: array [hr, vals]
	 */
	function groupInDays(values){ // TODO I was trying to make this work
		var days = {};
		var result = [];		
		values.forEach(function(valuePair){
		    var timestamp = valuePair.timestamp;
		    var value = valuePair.value;
		    if (!(value instanceof Object)){
		    	value = {val: value};
            }
		    Object.keys(value).forEach(function(key){
		        if(!days[key]){
                        days[key] = [];
                }
                days[key].push(value[key]);
		    });


		});		
		

       var d = 0;
       for (var key in days) {
           days[key].forEach(function(v){
               result.push([d, v]);                
           });
           d ++;
       }

		return [result, Object.keys(days)];		
	}
	/**
	 * Loads required libs dynamically
	 * @done: is the function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
	 */
	function loadlibs(done) {
	    if(typeof window.d33 === 'undefined'){
            $.getScript(d33_LIB_URL, function(data, textStatus, jqxhr) {
                window.d33 = window.d3;
                window.d3 = null;
                console.log("just loaded!", window.d33.version);
                done(textStatus === 'success');
            }); 
	    }else{       
           console.log(d33.version, " is already loaded");
           done(true);
        }   

	}

	/**
	 * Creates the required style classes and appends them to the document head
	 */
	function addStyles() {
		var style = document.createElement('style');
		style.type = 'text/css';

		// TODO: use multline string in the last version instead of concat. +
		/*	style.innerHTML = `.box{font: 10px sans-serif;}
		 .box line, .box rect, .box circle {	 fill: #fff; stroke: #000;	 stroke-width: 1.5px;}
		 .box .center {	 stroke-dasharray: 3,3; }
		 .box .outlier { fill: none; stroke: #ccc;}`;*/

		style.innerHTML = "body{font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;}" 
		+ ".box{font: 10px sans-serif; display: inline-block;  position: absolute;   top: 10px;    left: 0;}"
		+ ".svg-container { display: inline-block; position: relative; width: 100%; padding-bottom: 60%; /* aspect ratio */ vertical-align: top; overflow: hidden;}"
		//+ ".svg-content-responsive { display: inline-block;  position: absolute;   top: 10px;    left: 0;}" 
		+ ".box line, .box rect, .box circle {	 fill: #ffffcc; stroke: #000;	 stroke-width: 1.5px;}"
		+ ".box .center {	 stroke-dasharray: 3,0; }" + ".box .outlier { fill: none; stroke: #ccc; stroke-width: 0.5px;}" 
		+ ".axis {  font: 12px sans-serif;}" + ".axis path, .axis line {  fill: none;  stroke: #000;  shape-rendering: crispEdges;}"
		+ ".x.axis path {   fill: none;  stroke: #000;  shape-rendering: crispEdges;}";

		document.getElementsByTagName('head')[0].appendChild(style);

	};
	function prepareDiv() {
		var div = document.getElementById(divId);
		while (div.firstChild) {
			div.removeChild(div.firstChild);
		}
		div.style.width = '100%';
	}

});


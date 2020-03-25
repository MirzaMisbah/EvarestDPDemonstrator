(function(divId, _data) {
	var _data = (_data instanceof Array) ? _data[0] : _data;
	'use strict';
	const d34_LIB_URL = "https://d3js.org/d3.v4.min.js";

	loadlibs(function(success) {
		if (_data && success) {
			addStyles();
			prepareDiv();
			var points = extractPoints(_data.values);
			build_chart(points);
		} else {
			console.log("no data found or no libs are loaded!");
		}
	});

	function build_chart(points) {
		// set the dimensions and margins of the graph
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 50
		},
		    width = 800 - margin.left - margin.right,
		    height = 400 - margin.top - margin.bottom;

		// parse the date / time
		var parseTime = d34.timeParse("%d-%b-%y");

		// set the ranges
		var x = d34.scaleTime().range([0, width]);
		var y = d34.scaleLinear().range([height, 0]);

		// define the line
		var valueline = d34.line().x(function(d) {
			return x(d.date);
		}).y(function(d) {
			return y(d.close);
		});

		// append the svg obgect to the body of the page
		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		
		/*	var svg = d34.select('#' + divId)
			.append("div")
			.classed("svg-container", true)
			.append("svg")			
			.attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
			.attr("viewBox", "0 0 800 400") // resizing responsive
			.classed("box", true)
			.append("g")			
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			*/
		
		//.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
		var svg = d34.select('#' + divId)
		              .append("svg").attr("preserveAspectRatio", "xMinYMin meet")
		              .attr("viewBox", "0 0 800 400")
		              .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Get the data

		// format the data
	/*	data.forEach(function(d) {
			d.date = parseTime(d.date);
			d.close = +d.close;
		});*/
		
		points.forEach(function(d) {
			d.date = d.x;
			d.close = +d.y;
		});

		// Scale the range of the data
		x.domain(d34.extent(points, function(d) {
			return d.date;
		}));

		y.domain([d34.min(points, function(d) {
            return d.close;
        }), d34.max(points, function(d) {
			return d.close;
		})]);

		// Add the valueline path.
		svg.append("path").data([points]).attr("class", "line").attr("d", valueline);

		// Add the X Axis
		svg.append("g").attr("transform", "translate(0," + height + ")").call(d34.axisBottom(x));

		// Add the Y Axis
		svg.append("g").call(d34.axisLeft(y));

	}

	/**
	 * Creates an array of arries [23, n] each hour of the day will have an array that contains all heart bear values registered for that hour in hrVals
	 * @result: array [hr, vals]
	 */
	function extractPoints(values) {
		var parseTime = d34.timeParse("%d-%b-%y");
		var points = [];
		for (var i = 0; i < values.length; i++) {
			// TODO: this check should be removed!
			var timestamp = values[i].timestamp;
			var value =  values[i].value;
            if (value instanceof Object) {
            	var yVal = Math.round(Math.sqrt(Math.pow(value.x, 2) + Math.pow(value.y, 2) + Math.pow(value.z, 2)) * 100) / 100;
            } else {
                var yVal = value;
			}

                //var date = new Date(_val.valueTimeStamp);
			var point = {
				x : new Date(timestamp),
				y : yVal
			};            
			points.push(point);

		}
		points  = points.sort(function(a, b) {  
			
		  
    		return a.x.getTime() - b.x.getTime();
		});	
				
		
		return points;
	}

	/**
	 * Loads required libs dynamically
	 * @done: is the function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
	 */
    function loadlibs(done) {                
        if (typeof d34 === 'undefined') {
            $.getScript(d34_LIB_URL, function(data, textStatus, jqxhr) {                
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

	/**
	 * Creates the required style classes and appends them to the document head
	 */
	function addStyles() {
		var style = document.createElement('style');

		style.type = 'text/css';

		style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 2px; }";

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


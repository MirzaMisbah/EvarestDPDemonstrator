/***
 * This code is based on https://bl.ocks.org/ctufts/298bfe4b11989960eeeecc9394e9f118
 * https://bl.ocks.org/HarryStevens/be559bed98d662f69e68fc8a7e0ad097
 */
(function(divId, _data) {
	//'use strict';
	const d34_LIB_URL = "https://d3js.org/d3.v4.min.js";    
    var Y_AXIS_LBL = "Sensor Value";
    var X_AXIS_LBL = "Time";
    var _data = (_data instanceof Array) ? _data[0] : _data;

	
	
	loadlibs(function(success) {
		if (_data && success) {
		    addStyles();
            prepareDiv();
			plot();
		}
	});

	function plot() {
	    
	    // prepare data
	    var pairs = makePairs(_data.values);
        var data = create_data(pairs[0], pairs[1], pairs.length);

        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
            d.yhat = +d.yhat;
        });
	    
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 40
		};
		var width = 960 - margin.left - margin.right;
		var height = 500 - margin.top - margin.bottom;



		var x = d34.scaleLinear().range([0,width]);

		var y = d34.scaleLinear().range([height,0]);

		var xAxis = d34.axisBottom().scale(x);

		var yAxis = d34.axisLeft().scale(y);
		
		
		
        x.domain(d34.extent(data, function(d) {
            return  d.x;
        }));
    
        y.domain(d34.extent(data, function(d) {         
            return d.y;
        }));
		

		var svg = d34.select('#' + divId)
						.append("div")
						.classed("svg-container", true)
						.append("svg")
						.attr("preserveAspectRatio", "xMinYMin meet") // resizing responsive
						.attr("viewBox", "0 0 960 500") // resizing responsive
						.classed("svg-content-responsive", true)						
						.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		
        

		var line = d34.line().x(function(d) {
			return x(d.x);
		}).y(function(d) {
			return y(d.yhat);
		});		

		
		
		
	    svg.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot").attr("r", 3.5).attr("cx", function(d) {          
            return x(d.x);
        }).attr("cy", function(d) {
            return y(d.y);
        });

        svg.append("path").datum(data).attr("class", "regression-line").attr("d", line);

		svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")")
        .call(xAxis.tickFormat(d34.timeFormat("%H:%M")));     
        
        
        svg.append("text")             
            .attr("class", "text-label")
            .attr("x", (width / 2)).attr("y", height + 30)                    
            .style("text-anchor", "middle")            
            .text(X_AXIS_LBL);


      
        svg.append("g").attr("class", "y axis")
        .call(yAxis);
        
        
       svg.append("text")
          .attr("class", "text-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text(Y_AXIS_LBL);    

    	function create_data(x, y, n) {
			var x_mean = 0;
			var y_mean = 0;
			var term1 = 0;
			var term2 = 0;		
			
		
			// calculate mean x and y
			x_mean /= n;
			y_mean /= n;

			// calculate coefficients
			var xr = 0;
			var yr = 0;
			for (let i = 0; i < x.length; i++) {
				xr = x[i] - x_mean;
				yr = y[i] - y_mean;
				term1 += xr * yr;
				term2 += xr * xr;

			}
			var b1 = term1 / term2;
			var b0 = y_mean - (b1 * x_mean);
			// perform regression

			var yhat = [];
			// fit line using coeffs
			for (let i = 0; i < x.length; i++) {
				yhat.push(b0 + (x[i] * b1));
			}

			var data = [];
			for (let i = 0; i < y.length; i++) {
				data.push({
					"yhat" : yhat[i],
					"y" : y[i],
					"x" : x[i]
				});
			}
			return (data);
		}

	}
	function makePairs(values) {		
		var x = [];
		var y = [];	
		
		for (let i = 0; i < values.length; i++) {
			let _val = values[i].value	;
			let timestamp = values[i].timestamp;
			if (_val instanceof Object) {
				var value =  Math.round(Math.sqrt(Math.pow(_val.x, 2) + Math.pow(_val.y, 2) + Math.pow(_val.z, 2)) * 100) / 100;
            } else {
				var value = _val;
			}

		
			/*date.getHours() * 60 * 60 + date.getMinutes() * 60  + date.getSeconds();*/			
			x.push(timestamp);
			y.push(value);			
			
			
		}
		return [x, y];
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

		style.innerHTML = ".regression-line {   stroke: #E4002B; fill: none;    stroke-width: 3; }" + ".axis path,.axis line {fill: none;    stroke: black;    shape-rendering: crispEdges;}" + ".axis text {font-size: 10px; font-family: sans-serif;}"
		+ ".text-label {font-size: large; fill: black;}" + ".dot { stroke: #293b47; fill: #7A99AC}" +
		 ".svg-container {    display: inline-block;    position: relative;    width: 100%;    padding-bottom: 60%; /* aspect ratio */    vertical-align: top;    overflow: hidden;}"+
		 ".svg-content-responsive { display: inline-block;  position: absolute;   top: 10px;    left: 0;}";
		
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

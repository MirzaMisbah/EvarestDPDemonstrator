/**
 *
 *
 * @sources:
 * 			https://bl.ocks.org/mbostock/3884955
 *			http://jsfiddle.net/G5z4N/3/
 *
 * @param {Object} divId
 * @param {Object} _data sensor data!
 */

(function(divId, _data) {
    var _data = (_data instanceof Array) ? _data[0] : _data;
    const d34_LIB_URL = "https://d3js.org/d3.v4.min.js";     

        
    var Y_AXIS_LBL = "Value";
    var X_AXIS_LBL = "Time";

    if (loadlibs(function(result) {
            addStyles();
            prepareDiv();
            if (_data && _data.values) {                
                var points = extractPoints(_data.values);
                build_multiline(points);
            }
        }))
        ;

    function extractPoints(values) {        
        var points = {};
   
        values.forEach(function(valuePair) {    
            
            var value   = valuePair.value;
            var timestamp    = valuePair.timestamp;
            if (!(value instanceof Object))
                value = {val : value};
            
            
            Object.keys(value).forEach(function(key){              
                if (!points[key]) {
                        points[key] = [];
                }
                points[key].push([timestamp,  value[key], key]);
            });
    
        });// forEach         
        // sorting each series value by time
        Object.keys(points).forEach(function(key){
            points[key].sort(function(a, b) {         
                return a[0] - b[0];
            });  
        });
        return points;
    }

    function build_multiline(points) {      
        
        
        var keys = Object.keys(points);
        var values = Object.values(points);
       
        var margin = {
            top : 20,
            right : 80,
            bottom : 30,
            left : 50
        };
        
        var width = 800 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;     
        
        var x = d34.scaleTime().range([0, width]),
            y = d34.scaleLinear().range([height, 0]),
            z = d34.scaleOrdinal(d34.schemeCategory10); // this is not used  
            
     
       
        var lineFunction = d34.line().curve(d34.curveBasis)
                                    .x(function(d) {    
                                                                                                                                                     
                                        return x(d[0]);
                                    }).y(function(d) {
                                        
                                        return y(d[1]);
                                    });        
        
       
       x.domain([
            d34.min(values, function(c) { return d34.min(c, function(v) { return v[0]; }); }),
            d34.max(values, function(c) { return d34.max(c, function(v) { return v[0]; }); })
       ]);

        y.domain([
            d34.min(values, function(c) { return d34.min(c, function(v) {  return +v[1]; }); }),
            d34.max(values, function(c) { return d34.max(c, function(v) { return +v[1]; }); })
        ]);
        
        z.domain(keys);
        
        
       /**
        * Chart container!
        */
        var svg = d34.select('#' + divId)
                    .append("svg:svg")                        
                    .attr("preserveAspectRatio", "xMinYMin meet") 
                    .attr("viewBox", "0 0 800 400"); // min-x, min-y, width and height

      var graph = svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    
                    
                    
      var linesGroup = graph.append("g")
                                    .attr("class", "lines");           

        
        graph.append('g')
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d34.axisBottom(x).tickFormat(d34.timeFormat("%H:%M")))
            .append("text")
            .attr("x", (width / 2)).attr("y", 20).attr("dy", ".71em").style("text-anchor", "middle").style("font-size", "12px").attr("fill", "#000")  
            .text(X_AXIS_LBL);

                
        graph.append('g').attr("class", "axis axis--y")
            .call(d34.axisLeft(y))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000").text(Y_AXIS_LBL);
        

        keys.forEach(function(key) {
           var linedata =  points[key];   
           var day = linesGroup 
                         .append("g")                         
                         .attr("class", "day");         
                    
               day.append("path")
                        .attr("class", "line")
                        .attr("d", lineFunction(linedata))
                        .attr("data-legend", key)                
                        .style("stroke", z(key));
                        
                 day.append("text")
                          .datum(function(d) { return {name: key, value: linedata[linedata.length - 1]}; })
                          .attr("transform", function(d) { return "translate(" + x(d.value[0]) + "," + y(d.value[1]) + ")"; })
                          .attr("x", 3)
                          .attr("dy", ".35em")
                          .attr("class", "lblFont")
                          .style("fill", z(key))
                          .text(function(d) { return d.name; });         
                        
                        
         });
    }

    function loadlibs(done) {
        // we need to check for the specific version of the library
        // typeof(d34) == 'undefined'|| d34.timeParse == 'undefined'
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

    function addStyles() {
        var style = document.createElement('style');

        style.type = 'text/css';

        style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 1.5px; } " +
        ".lblFont { font-size:15px; font-weight: bold;}";
        
       

        document.getElementsByTagName('head')[0].appendChild(style);

    };
    function prepareDiv() {
        var div = document.getElementById(divId);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.style.width = '100%';
        div.style.height = '100%';
    }

});

window.addEventListener('load', function (event) {
    var motionSensorsMinion = function (_divId, _dataChannel) {
        'use strict';

        var div = document.getElementById(_divId);
        var h3 = document.createElement('h5');
        var textNode = document.createTextNode('Null');


        var limit = 60 * 1,
            duration = 250,
            now = new Date(Date.now() - duration),
            n = 200;

        var groups = {
            gyr : {
                color : 'blue',
                value : 0,
                data : []
            }
        };
        const D3_LIB_URL = "https://d3js.org/d3.v4.min.js";

        var findParent = function (el, parentType) {
            while ((el = el.parentElement) && !(el.nodeName.toLowerCase() === parentType));
            return el;
        };

        var updateUI = function (dataPoint) {
            var showing = findParent(document.getElementById(_divId), 'section').classList.contains('show');
            if (showing){
                var currentData = Math.round(Math.sqrt(Math.pow(dataPoint.x, 2) + Math.pow(dataPoint.y, 2) + Math.pow(dataPoint.z, 2)) * 100) / 100;
                var newNode = document.createTextNode('Gyroscope value: ' + currentData);
                h3.replaceChild(newNode, textNode);
                textNode = newNode;
                groups.gyr.value = currentData;
            }
            else {
                clearDiv();
            }

        };

        function startApp() {
            h3.appendChild(textNode);
            div.appendChild(h3);
            for (var name in groups) {
                groups[name].data = d3.range(n).map(function() {
                    return 0
                });
            }
            _dataChannel.addEventListener('add', updateUI);
        }

        function build_chart() {
            var build_gyroscope = function () {
                var margin = {
                        top : 20,
                        right : 20,
                        bottom : 40,
                        left : 20
                    },
                    width = 960 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom,
                    maxYScale = 1;
                var svg = d3.select('#' + _divId).append("div").classed("svg-container", true).append("svg").attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 960 500").classed("box", true),
                    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var x = d3.scaleLinear()
                    .domain([0, n-1])
                    .range([0, width]);
                var y = d3.scaleLinear()
                    .domain([0, maxYScale])
                    .range([height, 0]);
                var line = d3.line()
                    .curve(d3.curveBasis)
                    .x(function(d, i) { return x(i)})
                    .y(function(d, i) { return y(d); });
                g.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);
                var xAxis = g.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + y(0) + ")")
                    .call(x.axis = d3.axisBottom(x));
                var yAxis = g.append("g")
                    .attr("class", "axis axis--y")
                    .call(y.axis = d3.axisLeft(y));
                g.append("g")
                    .attr("clip-path", "url(#clip)")
                    .append("path")
                    .datum(groups.gyr.data)
                    .attr("class", "line")
                    .style('stroke', groups.gyr.color)
                    .transition()
                    .duration(duration)
                    .ease(d3.easeLinear)
                    .on("start", tick);
                function tick() {
                    var showing = findParent(document.getElementById(_divId), 'section').classList.contains('show');
                    if (showing) {
                        // Push a new data point onto the back.
                        groups.gyr.data.push(groups.gyr.value);
                        // Redraw the y Axis
                        if (groups.gyr.value > maxYScale) {
                            maxYScale = groups.gyr.value;
                            y.domain([0, maxYScale]);
                            yAxis.call(y)
                        }
                        // Redraw the line.
                        d3.select(this)
                            .attr("d", line)
                            .attr("transform", null);
                        // Slide it to the left.
                        d3.active(this)
                            .attr("transform", "translate(" + x(-1) + ",0)")
                            .transition()
                            .on("start", tick);
                        // Pop the old data point off the front.
                        groups.gyr.data.shift();
                    }
                }
            };
            build_gyroscope();
        }

        /**
         * Loads required libs dynamically
         * @done: is the function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
         */
        var loadJS = function(lib, done, location=document.querySelector('body')){
            //url is URL of external file, implementationCode is the code
            //to be called from the file, location is the location to
            //insert the <script> element

            var scriptTag = document.createElement('script');
            scriptTag.src = lib;

            scriptTag.onload = done;
            scriptTag.onreadystatechange = done;

            location.appendChild(scriptTag);
        };

        /**
         * Creates the required style classes and appends them to the document head
         */
        function addStyles() {
            var style = document.createElement('style');

            style.type = 'text/css';

            style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 1.5px; }";

            document.getElementsByTagName('head')[0].appendChild(style);

        }

        function clearDiv() {
            var div = document.getElementById(_divId);
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
            div.style.width = '100%';
            _dataChannel.addEventListener('remove', updateUI);
        }

        var callbackFunction = function(success) {
            if (success) {
                addStyles();
                clearDiv();
                startApp();
                build_chart();

            } else {
                console.log("no data found or no libs are loaded!");
            }
        };

        if (!('d3' in window)) {
            loadJS(D3_LIB_URL, callbackFunction);
        } else {
            callbackFunction(true);
        }
    };

    app.minionLoader.storeNewMinion('Gyroscope Motion', 'communicator', motionSensorsMinion.toLocaleString());
});
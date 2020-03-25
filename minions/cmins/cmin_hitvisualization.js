(function (_divId, _dataChannels) {
    'use strict';
    var _dataChannel = (_dataChannels instanceof Array) ? _dataChannels[0] : _dataChannels;
    var div = document.getElementById(_divId);
    var h3 = document.createElement('h5');
    var textNode = document.createTextNode('Null');


    var limit = 60 * 1,
        duration = 250,
        now = new Date(Date.now() - duration),
        n = 200;

    var groups = {
        hit : {
            color : 'black',
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
        if (showing) {
            var currentData = dataPoint.value;
            var newNode = document.createTextNode('Hit value: ' + currentData);
            if (currentData > 18) {
                window.navigator.vibrate(300);
            }
            h3.replaceChild(newNode, textNode);
            textNode = newNode;
            groups.hit.value = currentData;
        } else {
            clearDiv();
        }

    };

    function startApp() {
        h3.appendChild(textNode);
        div.appendChild(h3);
        for (var name in groups) {
            groups[name].data = d34.range(n).map(function() {
                return 0
            });
        }
        if (_dataChannel) {
            _dataChannel.addEventListener('add', updateUI, 'Hit visualization');
        }
    }

    function build_chart() {
        var build_acceleration = function () {
            var margin = {
                    top : 20,
                    right : 20,
                    bottom : 40,
                    left : 20
                },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom,
                maxYScale = 1;
            var svg = d34.select('#' + _divId).append("svg").attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 960 500"),
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var x = d34.scaleLinear()
                .domain([0, n-1])
                .range([0, width]);
            var y = d34.scaleLinear()
                .domain([0, maxYScale])
                .range([height, 0]);
            var line = d34.line()
                .curve(d34.curveBasis)
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
                .call(x.axis = d34.axisBottom(x));
            var yAxis = g.append("g")
                .attr("class", "axis axis--y")
                .call(y.axis = d34.axisLeft(y));
            g.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                .datum(groups.hit.data)
                .attr("class", "line")
                .style('stroke', groups.hit.color)
                .transition()
                .duration(duration)
                .ease(d34.easeLinear)
                .on("start", tick);
            function tick() {
                var showing = findParent(document.getElementById(_divId), 'section').classList.contains('show');
                if (showing) {
                    // Push a new data point onto the back.
                    groups.hit.data.push(groups.hit.value);
                    // Redraw the y Axis
                    if (groups.hit.value > maxYScale) {
                        maxYScale = groups.hit.value;
                        y.domain([0, maxYScale]);
                        yAxis.call(y)
                    }
                    // Redraw the line.
                    d34.select(this)
                        .attr("d", line)
                        .attr("transform", null);
                    // Slide it to the left.
                    if (checkStarted()) {
                        d34.active(this)
                            .attr("transform", "translate(" + x(-1) + ",0)")
                            .transition()
                            .on("start", tick);
                    }
                    // Pop the old data point off the front.
                    groups.hit.data.shift();
                }
            }
        };
        build_acceleration();
    }

    /**
     * Loads required libs dynamically
     * @done: is the function to be called when loading is done, it takes a boolean which value is true if the library was loaded successfully.
     */
    function loadJS (done, location=document.querySelector('body')){
        if (typeof d34 === 'undefined') {
            //url is URL of external file, implementationCode is the code
            //to be called from the file, location is the location to
            //insert the <script> element
            var scriptTag = document.createElement('script');
            scriptTag.src = d34_LIB_URL;
            var callback = function(success) {
                d34 = window.d3;
                window.d3 = null;
                console.log(d34.verion, 'was loaded successfully!');
                done(success);
            };

            scriptTag.onload = callback();
            scriptTag.onreadystatechange = callback();
            location.appendChild(scriptTag);
        } else {
            console.log(d34.version, ' is already loaded');
            done(true);
        }
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
        if (_dataChannel) {
            _dataChannel.removeEventListener('Hit visualization');
        }
        if (window.d3){
            window.d3.select('#' + _divId + ' svg').remove();
        }
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

    function checkStarted () {
        var isTrueSet = (document.getElementById(_divId)) ? (document.getElementById(_divId).getAttribute('data-active').toLowerCase() === 'true') : false;
        return isTrueSet;
    }

    if (!checkStarted()) {
        clearDiv();
    } else {
        loadJS(callbackFunction);
    }
});

/**
 * This file contains a dummy implementation of a visualization minion (cmin)
 * @namespace CommunicatorMinionStreamDataExample
 */

(function (divId, inputDataChannels){
    'use strict';

    /**
     * Defines all necessary data of a minion
     * @memberOf CommunicatorMinionStreamDataExample
     * @type {Object}
     */
    const minionObject ={
        // Define all libraries and dependencies of your current minion here, name is the name of the attached object to window, uir the ressource uri and source is the default name of the loaded library object.
        dependencies : [
            {"name": "d34", "uri": "https://d3js.org/d3.v4.min.js", source : "d3"}
        ],
        // Initialization of a container
        div : document.getElementById(divId),

        // Custom HTML elements
        headline : document.createElement('h5'),
        headlineText : document.createTextNode('Waiting for input.'),

        // Custom visualization variables
        duration : 250,
        n : 200,
        config : {
            color : 'red',
            value : 0,
            data : []
        }
    };

    // Start the functionality of the minion
    if (checkStarted()){
        loadDependencies(function(success) {
            if (success) {
                clearMinionEnvironment();
                addStyles();
                startApp();
                build_chart();

            } else {
                console.log("no data found or no libs are loaded!");
            }
        }, minionObject.dependencies);
    } else {
        clearMinionEnvironment();
    }

    /**
     * Hanling of a new data point received by the minion
     * @memberOf CommunicatorMinionStreamDataExample
     * @inner
     * @param {Object} added_value The new value object
     */
    function newValue (added_value) {
        var last = added_value instanceof Array ? added_value[added_value.length - 1] : added_value;
        if (last) {
            if (!isNaN(last.value.x) && !isNaN(last.value.y) && !isNaN(last.value.z)) {
                minionObject.config.value = Math.round(Math.sqrt(Math.pow(last.value.x, 2) + Math.pow(last.value.y, 2) + Math.pow(last.value.z, 2)) * 100) / 100;
            } else {
                minionObject.config.value = last.value;
            }
            var newNode = document.createTextNode(inputDataChannels[0].creator + ': ' + inputDataChannels[0].name + ' value: ' + minionObject.config.value);
            minionObject.headline.replaceChild(newNode, minionObject.headlineText);
            minionObject.headlineText = newNode;
        } else {
            var newNode = document.createTextNode('Please add an appropriate input data channel!');
            minionObject.headline.replaceChild(newNode, minionObject.headlineText);
            minionObject.headlineText = newNode;
            minionObject.config.value = null;
        }
    }

    /**
     * Starts the main application.
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
     */
    function startApp() {
        inputDataChannels.forEach(function (dataChannel) {
            if (dataChannel) {
                dataChannel.removeEventListener(divId);
                dataChannel.addEventListener('add', newValue, divId);
            }
        });

        minionObject.div.appendChild(minionObject.headline);
        minionObject.config.data = d34.range(minionObject.n).map(function() {
            return 0
        });
        minionObject.headline.appendChild(minionObject.headlineText);

    }


    /**
     * Builds the visualization
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
     */
    function build_chart() {
        var margin = {
                top : 20,
                right : 20,
                bottom : 40,
                left : 20
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            maxYScale = 1;
        var svg = d34.select('#' + divId).append("svg").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", "0 0 960 500"),
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x = d34.scaleLinear().domain([0, minionObject.n - 1]).range([0, width]);
        var y = d34.scaleLinear().domain([0, maxYScale]).range([height, 0]);
        var line = d34.line().x(function(d, i) {
            return x(i)
        }).y(function(d, i) {
            return y(d);
        });
        g.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", width).attr("height", height);
        var xAxis = g.append("g").attr("class", "axis axis--x").attr("transform", "translate(0," + y(0) + ")").call(x.axis = d34.axisBottom(x));
        var yAxis = g.append("g").attr("class", "axis axis--y").call(y.axis = d34.axisLeft(y));
        g.append("g").attr("clip-path", "url(#clip)").append("path").datum(minionObject.config.data).attr("class", "line").style('stroke', minionObject.config.color).transition().duration(minionObject.duration).ease(d34.easeLinear).on("start", tickAcc);
        function tickAcc() {
            // Push a new data point onto the back.
            if (minionObject.config.value !== null) {
                minionObject.config.data.push(minionObject.config.value);
                // Redraw the y Axis
                if (minionObject.config.value > maxYScale) {
                    maxYScale = minionObject.config.value;
                    y.domain([0, maxYScale]);
                    yAxis.call(y)
                }
                // Redraw the line.
                d34.select(this).attr("d", line).attr("transform", null);
                // Slide it to the left.
                if (checkStarted()) {
                    d34.active(this).attr("transform", "translate(" + x(-1) + ",0)").transition().on("start", tickAcc);
                }
                // Pop the old data point off the front.
                minionObject.config.data.shift();
            } else {
                d34.select('#' + divId + ' svg').remove();
            }

        }
    }

    /**
     * Loads required libs dynamically
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
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
     * Creates the required style classes and appends them to the document head
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
     */
    function addStyles() {
        var style = document.createElement('style');

        style.type = 'text/css';

        // Insert custom styles here
        style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 1.5px; }";

        document.getElementsByTagName('head')[0].appendChild(style);

    }

    /**
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
     */
    function clearMinionEnvironment() {

        // Clear the frontend
        while (minionObject.div.firstChild) {
            minionObject.div.removeChild(minionObject.div.firstChild);
        }
        minionObject.div.style.width = '100%';

        // Clear the input data channels
        if (inputDataChannels){
            inputDataChannels.forEach(function (dataChannel) {
                if (dataChannel) {
                    dataChannel.removeEventListener(divId);
                }
            });
        }

        // Clear the visualization
        if (d34){
            d34.select('#' + divId + ' svg').remove();
        }
    }

    /**
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf CommunicatorMinionStreamDataExample
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }
});

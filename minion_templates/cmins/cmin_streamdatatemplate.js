/**
 * This file contains a template for the implementation of a visualization minion (cmin) of streaming data.
 * @namespace CommunicatorMinionStreamDataTemplate
 */

(function (divId, inputDataChannels){
    'use strict';

    /**
     * Defines all necessary data of a minion
     * @memberOf CommunicatorMinionStreamDataTemplate
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


        // Custom visualization variables

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
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @inner
     * @param {Object} added_value The new value object
     */
    function newValue (added_value) {
        // Insert handler here
    }

    /**
     * Starts the main application.
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function startApp() {
        inputDataChannels.forEach(function (dataChannel) {
            if (dataChannel) {
                dataChannel.removeEventListener(divId);
                dataChannel.addEventListener('add', newValue, divId);
            }
        });

        // Insert custom start code here

    }


    /**
     * Builds the visualization
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function build_chart() {
        // Insert visualization code here
    }

    /**
     * Loads required libs dynamically
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
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
     * @memberOf CommunicatorMinionStreamDataTemplate
     */
    function addStyles() {
        var style = document.createElement('style');

        style.type = 'text/css';

        // Insert custom styles here
        //Example: style.innerHTML = ".line {  fill: none;  stroke: steelblue;  stroke-width: 1.5px; }";

        document.getElementsByTagName('head')[0].appendChild(style);

    }

    /**
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
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
    }

    /**
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }
});


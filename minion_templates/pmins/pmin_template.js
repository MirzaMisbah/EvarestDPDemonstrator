/**
 * This file contains a template for the implementation of a perceiver minion (pmin) that is able to produce streaming data as well as fetching static third party data.
 * @namespace PerceiverMinionTemplate
 */


(function (divId, outputChannels) {

    /**
     * Defines all necessary data of a minion
     * @memberOf PerceiverMinionTemplate
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
                startApp();
            } else {
                console.log("no data found or no libs are loaded!");
            }
        }, minionObject.dependencies);
    } else {
        clearMinionEnvironment();
    }

    /**
     * Starts the main application.
     * @inner
     * @memberOf PerceiverMinionTemplate
     */
    function startApp() {

        // Example for the startup with random data generation
        outputChannels.forEach(function (chan) {
            chan.intervalObject = setInterval(function () {
                chan.push({timestamp : Date.now(), value : Math.random()});
            }, 100);
        });

        // Insert custom start code here

    }

    /**
     * Loads required libs dynamically
     * @inner
     * @memberOf PerceiverMinionTemplate
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
     * Clear the div at the beginning of the minion start and remove all event listeners already registered at the inputDataChannels
     * @inner
     * @memberOf PerceiverMinionTemplate
     */
    function clearMinionEnvironment() {

        // Clear the frontend
        while (minionObject.div.firstChild) {
            minionObject.div.removeChild(minionObject.div.firstChild);
        }
        minionObject.div.style.width = '100%';

        // Clear the output data channels
        if (outputChannels){
            outputChannels.forEach(function (chan) {
                if (chan.intervalObject) {
                    clearInterval(chan.intervalObject);
                }
            });
        }
    }

    /**
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf PerceiverMinionTemplate
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }
});
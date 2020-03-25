(function (divId, outputChannels) {

    var minionObject = {
        dependencies : [
            {"name": "d34", "uri": "https://d3js.org/d3.v4.min.js", source : "d3"}
        ],
        dataURL : 'ressources/stock_potato.csv'
    };

    /**Put the csv file in the data channel. */
    function startMinion() {
        if (checkStarted()){
            if (outputChannels)
            {
                var outputchannel = outputChannels[0];
                d34.csv(minionObject.dataURL, function(data) {
                    data.forEach(function (dat) {
                        var timestamp = Date.parse(dat.TIMESTAMP);
                        delete dat.TIMESTAMP;
                        Object.keys(dat).forEach(function (key) {
                            if (dat[key] === '') {
                                dat[key] = null;
                            } else {
                                dat[key] = parseFloat(dat[key]);
                            }
                        });
                        var newObject = {
                            timestamp : timestamp,
                            value : dat
                        };
                        outputchannel.push(newObject);
                    })
                });
            }
        }
    }

    loadDependencies(startMinion);

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
     * Checks if the minion is started of stopped.
     * @inner
     * @memberOf CommunicatorMinionStreamDataTemplate
     * @returns {boolean} True if started.
     */
    function checkStarted () {
        return (document.getElementById(divId)) ? (document.getElementById(divId).getAttribute('data-active').toLowerCase() === 'true') : false;
    }
});

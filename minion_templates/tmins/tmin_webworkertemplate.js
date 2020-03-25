/**
 * This file contains a template for the implementation of a thinker minion implemented as a web worker.
 * @namespace ThinkerMinionWebWorkerTemplate
 */

/**
 * Defines all necessary data of a minion
 * @memberOf ThinkerMinionWebWorkerTemplate
 * @type {Object}
 */
var minionObject = {
    _self : self,
    origin : self.origin,

    internalDependencies : [{name : 'ressourceName', uri: '/sources/that/are/in/your/project/folders'}, {name : 'keras', uri : 'libs/thirdparty/keras.min.js'}],
    externalDependencies : [{name : 'ressourceName', uri: 'https://example.com/sources/that/are/not/in/your/project/folders'}, {name : 'numjs', uri:'https://cdnjs.cloudflare.com/ajax/libs/numjs/0.16.0/numjs.js'}],

    /* More models possible here */
    modelSource : self.origin + '/path/to/the/model/binary',

    /* Specific minion configurations */
    buffer : [],
    max_buffer_size : 100,
};

/**
 * Transforms the uri of the dependencies such that they are accessible from the web worker thread
 * @memberOf ThinkerMinionWebWorkerTemplate
 * @param {String} origin The applications origin consisting of [protocol]://[domain]:[port]
 * @param {Object} dependencies All the internal dependecies with name and uri
 * @returns {Object} The transformed dependencies.
 */
var transformInternalUris = function (origin, dependencies) {
    dependencies.forEach(function (dependency) {
        dependency.uri = origin + '/' + dependency.uri;
    });
    return dependencies;
};

/**
 * Fetches all necessary dependant libraries and then asynchronously calls a callback function
 * @memberOf ThinkerMinionWebWorkerTemplate
 * @param {Object} dependencies All dependecies of the minion with name and uri
 * @param {function} callback Callback function that is triggered once all libraries are loaded.
 */
var fetchScripts = function (dependencies, callback) {
    var fetchPromises = [];
    dependencies.forEach(function (dependency) {
        fetchPromises.push(fetch(dependency.uri, {method : 'GET', headers : {'Accept' : 'application/javascript'}, mode : 'cors', cache : 'default'})
            .catch(function(err){
                console.warn('Not possible to load: ' + dependency.uri);
                return null;
            }).then(function (res) {
                if (res) {
                    return res.text()
                        .then(function (script) {
                            if (script.toLowerCase() !== 'not found'){
                                eval(script);
                            }
                        });
                }
                return;
        }));
    });

    Promise.all(fetchPromises)
        .then(function () {
            callback();
        })
};

minionObject.dependencies = minionObject.externalDependencies.concat(transformInternalUris(minionObject.origin, minionObject.internalDependencies));


fetchScripts(minionObject.dependencies, function () {
    function estimationClass () {
        // Implement a constructor that is able to solve the estimation problem


        this.load = function (config, onLoaded) {
            var filePath = config.model;

            /* Initialize a model like in this example with a keras model
                this.model = new KerasJS.Model({filepath:filePath, gpu:false});
                this.model.ready().then(function () {
                    onLoaded();
                });
            */
            onLoaded();
        };
        this.predict = function (X, onPredict) {
            // Do a prediction
            var res = 1;
            onPredict(res);
        }
    }


    // Create the model
    minionObject.model = new estimationClass();

    // Load the model from the given binary file
    minionObject.model.load({"model": minionObject.modelSource}, function(){

        // Setup the Event listener of the Web Worker once the model is loaded
        minionObject._self.addEventListener('message', function(e) {
            var name = e.data.creator;
            var sensor_features = [e.data.value.value.x, e.data.value.value.y, e.data.value.value.z];
            minionObject.buffer.push(e.data);
            if (minionObject.buffer.length > minionObject.max_buffer_size) {
                minionObject.buffer.shift();
            }
        }, false);

        // Do estamations in a regularly repeated intvall (this is not a need, the estmation could also be done directly when data arrives in the event listener defined above)
        minionObject._self.estimationInterval = setInterval(function(){
            // Get the minion buffer
            var x = minionObject.buffer;

            // Do the prediction on the buffered data and send it back to the main thread
            // This works similar to sklearn: you provide an array of inputs [x], and get an array of outputs.
            minionObject.model.predict([x], function(yp, err){
                minionObject._self.postMessage({value: yp, timestamp : Date.now()});
            })
        }, 1000);
    });

});
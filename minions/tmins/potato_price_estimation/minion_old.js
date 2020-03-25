/**
 * This is a minion which implements a damage estimation from the 
 * sensory data coming to this minion.
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

    internalDependencies : [
	{name : 'keras', uri : self.origin + '/libs/thirdparty/keras.min.js'}, 
	{name : 'estimator1', uri : self.origin + '/minions/tmins/potato_price_estimation/priceestimator1.js'},
	{name : 'estimator2', uri : self.origin + '/minions/tmins/potato_price_estimation/priceestimator2.js'},
	{name : 'estimator3', uri : self.origin + '/minions/tmins/potato_price_estimation/priceestimator3.js'}
    ],

    /* More models possible here */
    modelW1 : self.origin + '/minions/tmins/potato_price_estimation/priceestimator1.bin',
    modelW2 : self.origin + '/minions/tmins/potato_price_estimation/priceestimator2.bin',
    modelW3 : self.origin + '/minions/tmins/potato_price_estimation/priceestimator3.bin',

    /* Specific minion configurations */
    buffer : [],
    max_buffer_size : 50,
    total_damage : 0.0,
    max_local_damage: 0.0,
    non_zero_count: 0 // number of times that the total damage is displayed, until it is zero
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
minionObject._self.addEventListener('message', function(e) {
    var name = e.data.creator;
    debugger;
    console.log(e.data);
    if (name.split('_')[0] === 'Crop Fin Data'){
        minionObject.db = e.data;
        fetchScripts(minionObject.internalDependencies, function () {
            // Create the model
            minionObject.model1 = new priceEstimator1();
            minionObject.model2 = new priceEstimator2();
            minionObject.model3 = new priceEstimator3();

            // Load the model from the given binary file
            minionObject.model1.load({"model": minionObject.modelW1}, function(){
                minionObject.model2.load({"model": minionObject.modelW2}, function(){
                    minionObject.model3.load({"model": minionObject.modelW3}, function(){
                        // these will be the predictions
                        var yp1=null, yp2=null, yp3=null
                        var x = [[["2013-08-07", 13.9, 13.9, 13.8, 13.8, 6, 82.9, 95, 13.8], ["2013-08-08", 13.8, 14, 13.8, 14, 5, 69.8, 90, 14], ["2013-08-12", 15, 15, 15, 15, 2, 30, 89, 15], ["2013-08-13", 15, 15, 15, 15, 2, 30, 89, 15], ["2013-08-14", 15, 15, 14.4, 14.8, 12, 177.2, 89, 14.8], ["2013-08-15", 15, 15.3, 15, 15.3, 8, 120.8, 90, 15.1], ["2013-08-16", 15.7, 16.1, 15.7, 16, 11, 175.6, 93, 16], ["2013-08-19", 15.7, 16.1, 15.7, 16, null, null, 96, 15.5], ["2013-08-22", 15.9, 15.9, 15.9, 15.9, 1, 15.9, 96, 15.9], ["2013-08-26", 16, 16, 16, 16, 3, 48, 95, 16], ["2013-08-27", 16, 16, 15.7, 15.7, 4, 63.7, 96, 15.9], ["2013-08-30", 16, 16, 16, 16, 2, 32, 99, 16], ["2013-09-03", 16.3, 16.4, 16.3, 16.4, 3, 49, 101, 16.3], ["2013-09-04", 16.5, 16.5, 16.5, 16.5, 1, 16.5, 101, 16.5], ["2013-09-05", 16.5, 16.8, 16.5, 16.8, 9, 149.6, 101, 16.6], ["2013-09-06", 16.1, 16.1, 15.6, 15.6, 6, 94.1, 107, 15.7], ["2013-09-13", 16.4, 16.4, 16.4, 16.4, 2, 32.8, 109, 16.4], ["2013-09-26", 16, 16, 16, 16, 5, 80, 107, 16], ["2013-09-27", 16, 16, 16, 16, 5, 80, 112, 16], ["2013-10-14", 17, 17, 17, 17, 1, 17, 117, 17]], [["2013-08-08", 13.8, 14, 13.8, 14, 5, 69.8, 90, 14], ["2013-08-12", 15, 15, 15, 15, 2, 30, 89, 15], ["2013-08-13", 15, 15, 15, 15, 2, 30, 89, 15], ["2013-08-14", 15, 15, 14.4, 14.8, 12, 177.2, 89, 14.8], ["2013-08-15", 15, 15.3, 15, 15.3, 8, 120.8, 90, 15.1], ["2013-08-16", 15.7, 16.1, 15.7, 16, 11, 175.6, 93, 16], ["2013-08-19", 15.7, 16.1, 15.7, 16, null, null, 96, 15.5], ["2013-08-22", 15.9, 15.9, 15.9, 15.9, 1, 15.9, 96, 15.9], ["2013-08-26", 16, 16, 16, 16, 3, 48, 95, 16], ["2013-08-27", 16, 16, 15.7, 15.7, 4, 63.7, 96, 15.9], ["2013-08-30", 16, 16, 16, 16, 2, 32, 99, 16], ["2013-09-03", 16.3, 16.4, 16.3, 16.4, 3, 49, 101, 16.3], ["2013-09-04", 16.5, 16.5, 16.5, 16.5, 1, 16.5, 101, 16.5], ["2013-09-05", 16.5, 16.8, 16.5, 16.8, 9, 149.6, 101, 16.6], ["2013-09-06", 16.1, 16.1, 15.6, 15.6, 6, 94.1, 107, 15.7], ["2013-09-13", 16.4, 16.4, 16.4, 16.4, 2, 32.8, 109, 16.4], ["2013-09-26", 16, 16, 16, 16, 5, 80, 107, 16], ["2013-09-27", 16, 16, 16, 16, 5, 80, 112, 16], ["2013-10-14", 17, 17, 17, 17, 1, 17, 117, 17], ["2013-11-08", 15.1, 15.1, 15, 15, 6, 90.5, 118, 15.1]]];

                        // TODO predict on features in minionObject.db (transformation necessary)
                        // Here x is an array of sequences. Every sequence is a historical
                        // record of prices.
                        minionObject.model1.predict(x, function(res, err){
                            yp1=res[0]
                            minionObject.model2.predict(x, function(res, err){
                                yp2=res[0]
                                minionObject.model3.predict(x, function(res, err){
                                    yp3=res[0];
                                    
                                    var estimation_result = {
                                        'root_mean_squared_error': [3.73, 7.0, 12.0],
                                        'estimated_prices': [yp1, yp2, yp3]
                                    }

                                    minionObject._self.postMessage({value: estimation_result, timestamp : Date.now()});
                                    console.log([yp1, yp2, yp3])
                                })
                            })
                        })

                        // make estimations here
                    });
                });
            });

        });
    }

}, false);



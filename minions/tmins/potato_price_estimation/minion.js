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

/**
 * The input data to the minion should be a json object, which has
 * the followign structure:
 * {
 *      "history":{
 *          "data": [[9 value array], [9 value array], ...]
 *      }
 * }
 * Here the values of "data" property of the json contain the history of 
 * the financial data, which corresponds to these columns:
 * "datum", "erster", "hoch", "tief", "letzter", "umsatz", "volumen", 
 * "oi", "kassa", similar to what 
 * https://www.kaack-terminhandel.de/en/eurex-european-processing-potato.html
 * provides from the API endpoints.
 */

function transformDataFormatForPriceEstimation (observations) {
    var transformed = [];
    observations.forEach(function (observation) {
        if (observation.value.OPEN !== null && observation.value.HIGH !== null && observation.value.LOW !== null &&  observation.value.CLOSE !== null &&  observation.value.TURNOVER !== null &&  observation.value.VOLATILITY !== null &&  observation.value.OI !== null &&  observation.value.OPENN !== null) {
            transformed.push([(new Date(observation.timestamp)).toISOString().substring(0, 10), observation.value.OPEN, observation.value.HIGH, observation.value.LOW, observation.value.CLOSE, observation.value.TURNOVER, observation.value.VOLATILITY, observation.value.OI, observation.value.OPENN])
        }
    });
    return transformed;
}

minionObject._self.addEventListener('message', function(e) {
    
    var name = e.data.creator;

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
                        
                        // json object with the description of the financial market history
                        var records = transformDataFormatForPriceEstimation(minionObject.db.value);
                        // var price_info = minionObject.db['value'][0]['value']
                        
                        // var records = price_info['history']['data']

                        // select last 20 records
                        var x = records.slice(records.length - 20);

                        // Here x is an array of sequences. Every sequence is a historical
                        // record of prices.
                        minionObject.model1.predict(x, function(res, err){
                            yp1=res[0]
                            minionObject.model2.predict(x, function(res, err){
                                yp2=res[0]
                                minionObject.model3.predict(x, function(res, err){
                                    yp3=res[0];
                                    
                                    // this comes from the notebook where the models are trained
                                    // this is list of root mean squared errors for different 
                                    // forecasting ranges
                                    var errors = [2.71, 4.29, 6.83]

                                    var estimation_result = {
                                        'upper_bound': [yp1 + errors[0], yp2 + errors[1], yp3 + errors[2]],
                                        'mean': [yp1, yp2, yp3],
                                        'lower_bound': [yp1 - errors[0], yp2 - errors[1], yp3 - errors[2]],
                                    }

                                    minionObject._self.postMessage({value: estimation_result, timestamp : Date.now()});
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



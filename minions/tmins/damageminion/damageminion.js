/**
 * This is a minion which implements a damage estimation from the 
 * sensory data coming to this minion.
 * @namespace ThinkerMinionWebWorkerTemplate
 */

// defines which model is used for predictions, e.g with weights or not
var model_folder = 'models/weight0.1'

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
	{name : 'modeljs', uri : self.origin + '/minions/tmins/damageminion/'+model_folder+'/npotatov2.js'}
    ],

    /* More models possible here */
    modelSource : self.origin + '/minions/tmins/damageminion/'+model_folder+'/npotatov2.bin',

    /* Specific minion configurations */
    buffer : [],
    max_buffer_size : 50,
    total_damage : 0.0,
    max_local_damage: 0.0,
    non_zero_count: 0, // number of times that the total damage is displayed, until it is zero
    damage_old : 0
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


fetchScripts(minionObject.internalDependencies, function () {
    // initializeDataStream
    minionObject._self.postMessage({value: 0, timestamp: Date.now()});

    // Create the model
    minionObject.model = new nPotatoV2();

    // Load the model from the given binary file
    minionObject.model.load({"model": minionObject.modelSource}, function(){

        // Setup the Event listener of the Web Worker once the model is loaded
        minionObject._self.addEventListener('message', function(e) {
            var name = e.data.creator;
            var sensor_features = [e.data.value.value.x, e.data.value.value.y, e.data.value.value.z];
            
            // this calculates the total activation of accelerometer
            var vector_length = 0.0;
            for(v of sensor_features){
                vector_length += v*v
            }
            vector_length = Math.sqrt(vector_length)

            minionObject.buffer.push(vector_length);
            if (minionObject.buffer.length > minionObject.max_buffer_size) {
                minionObject.buffer.shift();
            }
        }, false);

        // Do estamations in a regularly repeated intvall (this is not a need, the estmation could also be done directly when data arrives in the event listener defined above)
        minionObject._self.estimationInterval = setInterval(function(){
            // Get the minion buffer
            var x = minionObject.buffer;

            if(x.length <  minionObject.max_buffer_size){
                return;
            }

            // Do the prediction on the buffered data and send it back to the main thread
            // This works similar to sklearn: you provide an array of inputs [x], and get an array of outputs.
            minionObject.model.predict([x], function(yp, err){
                var pred = yp;
                console.log("Height estimation: " + pred)

                // transform the height of the fall into the damage percentage estimator
                var damages = 0.71025 * pred - 9.323

                // if damage is negative - set it to zero
                if(damages < 0.0) {
                    damages = 0.0
                    pred = 0.0  
                    // set estimations to zero of height, for consistent console output
                }

                var total_damage = minionObject.total_damage
                var max_local_damage = minionObject.max_local_damage
                var non_zero_count = minionObject.non_zero_count
                
                // check if max damage thus far is smaller than the one currently
                max_local_damage = damages > max_local_damage ? damages : max_local_damage

                // check if the damage percentage has settled again to zero
                if(damages < 1e-3 && max_local_damage > 0.0){
                    // the damages output has settled down. Calculate the estimated damage
                    // by the hit
                    total_damage = 1.0 - (1.0 - total_damage/100.0) * (1.0 - max_local_damage/100.0)
                    
                    // return back to percentages
                    total_damage = total_damage * 100.0

                    // reset the maximum local damage
                    max_local_damage = 0;
                    non_zero_count = 15; // show the expected damage for 2 seconds
                }

                if(non_zero_count > 0){
                    non_zero_count = non_zero_count - 1
                }

                minionObject.total_damage = total_damage;
                minionObject.max_local_damage = max_local_damage
                minionObject.non_zero_count = non_zero_count
                
                // only output the damages for 2 sec
                if(non_zero_count <= 0){
                    if(total_damage > 0.0 && minionObject.damage_old !== total_damage) {
                        console.log("Damage: " + total_damage)
                        minionObject._self.postMessage({value: total_damage, timestamp: Date.now()});
                        minionObject.damage_old = minionObject.total_damage;
                        //minionObject.total_damage = 0.0
                    }
                }
            })
        }, 300);
    });

});

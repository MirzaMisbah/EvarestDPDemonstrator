var _self = self;
var ressourceUris = ['libs/datalib/data-channel.js', 'libs/thirdparty/keras.min.js'];

var modelSource = self.origin + '/minions/tmins/hitdetectionminion/npotatoestimator.bin';

var transformUris = function (origin, uris) {
    var res = [];
    uris.forEach(function (uri) {
        res.push(origin + '/' + uri);
    });
    return res;
};

var fetchScripts = function (uris, callback) {
    var fetchPromises = [];
    uris.forEach(function (uri) {
        fetchPromises.push(fetch(uri).then(function (res) {
            return res.text()
                .then(function (script) {
                    eval(script);
                });
        }));
    });

    Promise.all(fetchPromises)
        .then(function () {
            callback();
        })
};

ressourceUris = transformUris(_self.origin, ressourceUris);

self.buffer = [];
self.currentFeatures = [];
self.pacemaker = 'Gyroscope';
self.max_buffer_size = 100;
self.record_timestamp = false;
self.inputCount = 2;

fetchScripts(ressourceUris, function () {
    function nPotatoEstimator() {
        this.transform__standardscaler = function (X) {
            var mean_ = [5.106805439656904, 3.5296469427025694, 5.106940744881836, 3.529649394648326, 5.107064906357282, 3.5296512189228215, 5.107180610709176, 3.529652774674852, 5.107276994818921, 3.529655911352894, 5.107350176570183, 3.5296615922812897, 5.107427387621162, 3.5296630909722966, 5.1075114586876955, 3.5296652576129346, 5.107568370914555, 3.529667753193592, 5.107611067191073, 3.529669453276447, 5.107653971016084, 3.529670545827226, 5.107704948459696, 3.529671715578213, 5.107760261545463, 3.5296745971599135, 5.107811853341154, 3.5296766597480964, 5.1078409873062265, 3.5296786417795394, 5.107859808731513, 3.5296803519319875, 5.107906716903107, 3.5296816995791076, 5.107942060596453, 3.529683184843991, 5.107972226250599, 3.5296846466131586, 5.10799505225151, 3.5296862292174356, 5.108012926140072, 3.5296871841504514, 5.1080374272278855, 3.5296881088746894, 5.10806159195378, 3.5296896881224353, 5.10807355274031, 3.529691082760987, 5.108089507239627, 3.529691782597661, 5.108111906204758, 3.5296930597576344, 5.108128247807914, 3.5296949545192766, 5.1081729043393995, 3.52969550834686, 5.1082242307942, 3.5299134999185844, 5.108270249631404, 3.529915461810843];
            var scale_ = [6.649074005768573, 5.362282595436894, 6.648976391248217, 5.362280985179425, 6.648886339399516, 5.362279785799685, 6.6488020639941166, 5.362278763131529, 6.648731239189319, 5.362276704258866, 6.648676875294523, 5.362272989125303, 6.648619602566948, 5.362272004182522, 6.648557467732201, 5.362270580643231, 6.648514894449773, 5.362268941710393, 6.6484828261561955, 5.362267824508099, 6.64845055245419, 5.362267105860683, 6.648412304505989, 5.362266336758305, 6.648370861435201, 5.362264443499168, 6.648332157576775, 5.362263088148259, 6.648310103832013, 5.362261786001418, 6.648295828292859, 5.362260661791864, 6.648260541182658, 5.362259775803805, 6.648233820471196, 5.362258799487153, 6.648210954733096, 5.362257838225254, 6.64819360356193, 5.362256798065361, 6.648180033163096, 5.362256169880446, 6.648161436230946, 5.362255561694942, 6.648143105879955, 5.362254523760836, 6.648133967598963, 5.362253607281349, 6.648121834241676, 5.362253146976885, 6.648104812282693, 5.3622523070758685, 6.648092394177987, 5.362251061424861, 6.6480589081034696, 5.362250697128553, 6.648020619587003, 5.3621473000307756, 6.647986271491702, 5.362146011174235];
            X = this.standardScalerCode(X, mean_, scale_);
            return X;
        };
        this.standardScalerCode = function (X, mean_, scale_) {
            var result = [];
            for (var i = 0; i < X.length; i++) {
                var x = X[i];
                var new_x = [];
                for (var j = 0; j < x.length; j++) {
                    var xv = x[j];
                    if (mean_ != null) {
                        xv = xv - mean_[j];
                    }
                    if (scale_ != null) {
                        xv = xv / scale_[j];
                    }
                    new_x.push(xv);
                }
                result.push(new_x);
            }
            return result;
        };
        this.transform__padsubsequence = function (X) {
            var length = 30;
            var step = 1;
            var n_features = 2;
            X = this.padSubsequenceCode(X, length, step, n_features);
            return X;
        };

        this.transform__flattenshape = function (X) {
            X = this.flattenShapeCode(X);
            return X;
        };

        this.flattenShapeCode = function (X) {
            var result = [];

            // test number of axes
            var axes = 0;
            var Xv = X;

            while (Xv instanceof Array) {
                axes += 1;
                Xv = Xv[0];
            }

            var myfunc = function (arr, axis = 0) {
                if (axis == axes - 1) {
                    return arr;
                }

                var result = [];
                for (var i = 0; i < arr.length; i++) {
                    result.push(myfunc(arr[i], axis + 1));
                }

                // flatten up to first dimension
                if (axis > 0) {
                    result = [].concat.apply([], result);
                }
                return result;
            };

            return myfunc(X);
        };

        this.transform = function (X) {
            X = this.transform__padsubsequence(X);
            X = this.transform__flattenshape(X);
            X = this.transform__standardscaler(X);
            return X;
        };
        this.postprocess = function (X) {
            var classes_ = ["0.0", "18.3", "9.0", "34.0"];
            X = this.labelBinarizerCode(X, classes_);
            return X;
        };
        this.labelBinarizerCode = function (X, classes_) {
            result = [];

            for (var i = 0; i < X.length; i++) {
                var y = X[i];
                var max_i = 0;
                // find the maximum index in array
                for (var j = 0; j < y.length; j++) {
                    if (y[max_i] < y[j]) {
                        max_i = j;
                    }
                }
                result.push(classes_[max_i]);
            }
            return result;
        };
        this.load = function (config, onloaded) {
            this.model = new KerasJS.Model({
                filepath: config['model'],
                gpu: false
            });
            this.config = config;
            this.model.ready().then(() => {
                onloaded();
            })
        };
        this.predict = function (X, onpredict) {
            var X = this.transform(X);
            var X_new = [];
            var this_model = this.model;
            var this_this = this;

            var recurr = function (outputData) {
                if (outputData != null) {
                    X_new.push(outputData['Output_1']);
                }

                if (X_new.length >= X.length) {
                    X_new = this_this.postprocess(X_new);
                    onpredict(X_new, null);
                } else {
                    var x = X[X_new.length];
                    x = {"Input_1": new Float32Array(x)};
                    this_model.predict(x).then(recurr).catch(err => {
                        onpredict(null, err);
                    });
                }
            };

            recurr(null)
        };
        this.padSubsequenceCode = function (X, length, step, n_features) {
            var result = [];

            // instance enumeration
            for (var i = 0; i < X.length; i++) {
                var x = X[i];
                var x_new = [];
                // pad with zeros
                for (var j = 0; j < length; j++) {
                    if (x.length - j > 0) {
                        x_new.unshift(x[x.length - j - 1])
                    } else {
                        var zeros = [];
                        for (var k = 0; k < n_features; k++) {
                            zeros.push(0);
                        }
                        x_new.unshift(zeros);
                    }
                }
                var x_step = [];
                for (var j = 0; j < length; j++) {
                    if (j % step == 0) {
                        x_step.push(x_new[j]);
                    }
                }
                result.push(x_step);
            }

            return result;
        }
    }

    function reset_current_features(){
        // set measurement vector to all zeros
        _self.currentFeatures = [];
        for(var i = 0; i < _self.inputCount; i++){
            _self.currentFeatures.push.apply(_self.currentFeatures, [0.0, 0.0, 0.0])
        }
    }

    function get_buffer_aggr(){
        // converts gyro and accelerometer vectors
        // to their length. Say Gyro = [1.0, 2.0, 0.0],
        // then it will be converted to 1*1 + 2*2 + 0*0 = 5,
        // same for accelerometer. These lengths are used
        // as features for AI.
        var result = [];
        for(var i = 0; i<_self.buffer.length; i++){
            var accelerometer = 0.0;
            for(var j = 0; j<3; j++){
                accelerometer += _self.buffer[i][j] * _self.buffer[i][j];
            }
            var gyro = 0.0;
            for(var j = 3; j<6; j++){
                gyro += _self.buffer[i][j] * _self.buffer[i][j]
            }
            result.push([Math.sqrt(accelerometer), Math.sqrt(gyro)])
        }
        return result
    }

    var model = new nPotatoEstimator();
    model.load({"model": modelSource}, function(){

        _self.addEventListener('message', function(e) {
            var name = e.data.creator;
            var sensor_features = [e.data.value.value.x, e.data.value.value.y, e.data.value.value.z];
            var i = 0;
            if (name === _self.pacemaker) {
                i = 1;
            }
            for(var j=0; j < sensor_features.length; j++){
                _self.currentFeatures[i*3+j] = sensor_features[j];
            }

            if(name == _self.pacemaker){
                if(_self.record_timestamp){
                    _self.currentFeatures.push(e.data.value.timestamp);
                }

                // add new record
                _self.buffer.push(_self.currentFeatures);

                // check for buffer length
                while( _self.buffer.length >  _self.max_buffer_size){
                    _self.buffer.shift();
                }
                reset_current_features();
            }
        }, false);

        _self.estimationInterval = setInterval(function(){
            // convert buffer of measurements to features
            var x = get_buffer_aggr();
            console.log("Sensors values: " + x)

            // this works similar to sklearn: you provide an
            // array of inputs [x], and get an array of outputs.
            model.predict([x], function(yp, err){
                console.log("Height estimation: " + yp[0]);
                var damage = (0.71025 * parseFloat(yp[0]) + (-9.323000000000015))
                if (damage < 0){
                    damage = 0;
                }
                console.log("Damage Potato percentage: " + damage.toFixed(2) + " %");
                _self.postMessage({value: parseFloat(yp[0]), timestamp : Date.now()});
            })
        }, 1000);
    });

});
(function (root) {

    class GenericSensorSimulator {
        constructor (type, frequency) {
            var _this = this;
            this.type = type;
            this.frequency = frequency;
            this.value = {x : 0, y : 0, z : 0};
            this.listenerType = 'devicemotion';
            this.onreading = function () {
                console.log(_this.value);
            };

            this.eventListener = function (event) {
                switch (_this.type) {
                    case 'Accelerometer':
                        _this.value = event.accelerationIncludingGravity;
                        break;
                    case 'Gyroscope':
                        _this.value = {x : (event.rotationRate.alpha*Math.PI)/180, y : (event.rotationRate.beta*Math.PI)/180, z : (event.rotationRate.gamma*Math.PI)/180};
                        break;
                    case 'LinearAccelerationSensor':
                        _this.value = event.acceleration;
                        break;
                    default:
                        break;
                }

            };
        }

        start() {
            var _this = this;
            window.addEventListener(this.listenerType, this.eventListener);
            this.readingInterval = setInterval(function(){
                _this.onreading();
            }, 1000/this.frequency);
        }

        stop () {
            clearInterval(this.readingInterval);
            this.readingInterval = null;
            window.removeEventListener('deviceorientation', this.eventListener);
        }

        get x () {
            return this.value.x;
        }
        get y () {
            return this.value.y;
        }
        get z () {
            return this.value.z;
        }

    }


    /***
     *
     * @param {Object} p_name: Accelerometer/Gyroscope/LinearAccelerationSensor
     * @param {Object} p_frequency
     * @param {Object} p_dbminion
     */

    class Sensor {


        constructor(p_name, p_frequency, p_outputDataChannel) {
            var I = this;
            this._name = p_name;
            this._dataChannel = p_outputDataChannel;
            this.iSensor = null;

            this.STRATEGIES = {'GENERIC' : 'generic_api_based', 'EVENTS' : 'event_listener_based'};
            this.strategy = null;

            this.prom = null;
            this.promReady = true;

            if (p_name == 'RandomSensor') {
                this.strategy = this.STRATEGIES.GENERIC;
            } else {
                if (p_name in window) {
                    this.promReady = false;
                    this.prom = navigator.permissions.query({ name: "accelerometer" })
                        .then(function (permission) {
                            if (permission.state != 'granted') {
                                I.strategy = I.STRATEGIES.EVENTS;
                            } else {
                                I.strategy = I.STRATEGIES.GENERIC;
                            }
                            I.promReady = true;
                        });
                } else {
                    this.strategy = this.STRATEGIES.EVENTS;
                }
            }


            var setProperties = function () {
                I.iSensor.onreading = function(){
                    I.dataChannel.push({
                        timestamp : new Date().getTime(),
                        value : {
                            x : I.iSensor.x,
                            y : I.iSensor.y,
                            z : I.iSensor.z
                        }
                    });
                };
                I.iSensor.onerror =  function(event){
                    console.error(event);
                };
            };

            if (this.prom) {
                Promise.resolve(this.prom)
                    .then(function () {
                        I.iSensor = I.handleInitialization(p_frequency);
                        setProperties();
                    })
            } else {
                this.iSensor = this.handleInitialization(p_frequency);
                setProperties();
            }



        }// constructor

        get name(){
            return this._name;
        }

        set name(_name){
            this._name = _name;
        }

        get dataChannel(){
            return this._dataChannel;
        }
        set dataChannel(_dataChannel){
            this._dataChannel = _dataChannel;
        }

        start(outDataChannel){
            var _this = this;
            if(outDataChannel){
                this._dataChannel = outDataChannel;
            }
            if (this.promReady) {
                this.iSensor.start();
            } else {
                Promise.resolve(this.prom)
                    .then(function () {
                        _this.iSensor.start();
                        _this.promReady = true;
                    })
            }
        }

        stop(){
            this.iSensor.stop();
        }

        handleInitialization(p_frequency) {
            switch (this.strategy) {
                case this.STRATEGIES.GENERIC:
                    switch(this.name) {
                        case "Accelerometer":
                            return new Accelerometer({ frequency : p_frequency });
                            break;
                        case "Gyroscope":
                            return new Gyroscope({ frequency : p_frequency  });
                            break;
                        case "LinearAccelerationSensor":
                            return new LinearAccelerationSensor({ frequency : p_frequency });
                            break;
                        case "RandomSensor":
                            return new RandomSensor({ frequency : p_frequency });
                            break;
                        default:
                            console.error(p_name, " sensor not found!");
                            return;
                    }// switch
                    break;
                case this.STRATEGIES.EVENTS:
                    return new GenericSensorSimulator(this.name, p_frequency);
            }
        }
    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Sensor;
    } else if (typeof exports !== 'undefined') {
        exports.Sensor = Sensor;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return Sensor;
        });
    } else {
        root.Sensor = Sensor;
    }

})(this);

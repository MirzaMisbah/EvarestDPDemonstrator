(function (root) {

    'use strict';
    /******************
     * This simulates a real sensor behavior, it should be used for testing purposes only
     */
    class RandomSensor{


        constructor(sensorOptions){
            this.frequency  = sensorOptions.frequency;
            this.generatingInterval = null;
        };


        start(){
            var I = this;
            this.generatingInterval =  self.setInterval(function(c){
                I.x = Math.random()* 100;
                I.y = Math.random()* 100;
                I.z = Math.random()* 100;
                I.callback();
            }, 1000/this.frequency);
        }

        stop(){
            clearInterval(   this.generatingInterval);
        }

        set onreading(callback){
            this.callback = callback;
        }


    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RandomSensor;
    } else if (typeof exports !== 'undefined') {
        exports.RandomSensor = RandomSensor;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return RandomSensor;
        });
    } else {
        root.RandomSensor = RandomSensor;
    }

})(this);
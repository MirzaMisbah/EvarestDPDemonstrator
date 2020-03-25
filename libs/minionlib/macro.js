(function (root) {

    'use strict';
    class Macro {
        constructor(/*TODO check all arguments*/name, config) {

            this.name = name;
            this.config = config;
            this.ready = false;
            if (!!config.code) {
                this.executionFunction = eval(config.code);
                this.ready = true;
            } else {
                throw Error('No code or repository uri given');
            }

        }

        get code () {
            return this.config.code;
        }

        get type () {
            return 'macro';
        }

        getExecutionFunction() {
            return this.executionFunction;
        }

        do() {
            this.getExecutionFunction()(window);
        }

        kill() {
            this.getExecutionFunction()(null);
        }

    }

    Macro.MACRO_TYPES = {
        MACRO : 'macro'
    };

    /**
     * Export the module for various environemnts
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Macro;
    } else if (typeof exports !== 'undefined') {
        exports.Macro = Macro;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return Macro;
        });
    } else {
        root.Macro = Macro;
    }

})(this);

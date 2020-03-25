(function (root) {

    function CustomValueScheme (valueObject) {
        this._valueObject = valueObject;
    }

    CustomValueScheme.prototype = {
        getValue : function () {
            return this._valueObject.value;
        },

        getTimeStamp : function () {
            return new Date(this._valueObject.valueTimeStamp);
        },

        getLabel : function () {
            return this._valueObject.valueString;
        },

        getType : function () {
            return this._valueObject.type;
        }
    };

    function CustomObservationDataScheme (dataObject) {
        this._rawJSON = JSON.parse(JSON.stringify(dataObject));
        this._dataObject = dataObject;
        for (var i = 0; i < this._dataObject.values.length; i++) {
            this._dataObject.values[i] = new CustomValueScheme(this._dataObject.values[i]);
        }
    }

    CustomObservationDataScheme.prototype = {

        getRawJSON : function () {
            return this._rawJSON;
        },

        getApplication : function () {
            return this._dataObject.applicationID;
        },

        getTimeStamp : function () {
            return new Date(this._dataObject.timestamp);
        },

        getType : function () {
            return this._dataObject.type;
        },

        getUnit : function () {
            return this._dataObject.unit;
        },

        getUserId : function () {
            return this._dataObject.userID;
        },

        getValues : function () {
            return this._dataObject.values;
        },

        addValues : function (values) {
            this._dataObject.values = this._dataObject.values.concat(values);
        }
    };

    /**
     * Export the module for various environemnts
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CustomObservationDataScheme;
    } else if (typeof exports !== 'undefined') {
        exports.CustomObservationDataScheme = CustomObservationDataScheme;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return CustomObservationDataScheme;
        });
    } else {
        root.CustomObservationDataScheme = CustomObservationDataScheme;
    }

}(this));
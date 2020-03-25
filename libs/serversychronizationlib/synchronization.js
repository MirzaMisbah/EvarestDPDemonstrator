'use strict';

(function (root) {

    function DataSynchService(endpoint) {
        this._endpoint = endpoint;
    }


    DataSynchService.prototype.synchronizeData = function (method, headers, body) {
        var settings = {
            method: method,
            headers: headers,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(body)
        };

        var _this = this;

        return fetch(this._endpoint, settings)
            .then(function (value) {
                if (value.ok) {
                    return value.json();
                } else {
                    return null;
                }
            }).catch(function (err) {
                console.log(err);
                return null;
            }).then(function (value) {
                if (value) {
                    value = _this._convertFromFHIR(value);
                    _this._lastSynched = value;
                }
                return value;
            });
    };

    DataSynchService.prototype.storeSynchedData = function (storageObject, settings, reload, dataToStore) {
        if (dataToStore)
            this._lastSynched = dataToStore;
        storageObject.sendCreateRequest(settings.userToken, this._lastSynched, settings.callbackMethod, reload);
    };

    DataSynchService.prototype._convertFromFHIR = function (fhirObjects) {
        var data = [];
        for (var i = 0; i < fhirObjects.length; i++) {
            var dataPoint = {
                'type' : fhirObjects[i].category.coding[0].display,
                'timestamp' : new Date(fhirObjects[i].effectiveDateTime.$date),
                'applicationID' : this._endpoint,
                'values' : [],
                'userID' : fhirObjects[i].subject.display
            };
            if (fhirObjects[i].component.length > 0) {
                dataPoint.unit = fhirObjects[i].component[0].valueQuantity.unit;
            } else {
                dataPoint.unit = null;
            }
            for (var j = 0; j < fhirObjects[i].component.length; j++){
                var valuePoint = {
                    'type' : fhirObjects[i].component[j].code.coding[0].display,
                    'value' : fhirObjects[i].component[j].valueQuantity.value,
                    'valueTimeStamp' : new Date(fhirObjects[i].component[j].valueDateTime.$date)
                };
                if (fhirObjects[i].component[j].valueQuantity.valueString) {
                    valuePoint.valueString = fhirObjects[i].component[j].valueQuantity.valueString;
                }
                dataPoint.values.push(valuePoint);
            }
            data.push(dataPoint);
        }
        return data;
    };

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataSynchService;
    } else if (typeof exports !== 'undefined') {
        exports.DataSynchService = DataSynchService;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return DataSynchService;
        });
    } else {
        root.DataSynchService = DataSynchService;
    }

}(this));
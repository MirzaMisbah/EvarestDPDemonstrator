
'use strict';

define(function (require) {
    const $ = require('jquery');
    const DataStorage = require('datastorage');

    function DataLoader (mainUrl) {
        this.storage =  new DataStorage();
        this.mainUrl = mainUrl;
    }

    DataLoader.prototype = {

        loadFitnessHeartRate: function (id_token, userId) {
            var _this = this;
            if (id_token && userId) {
                var authorization = 'Bearer ' + id_token;
            } else {
                var authorization = 'Bearer ' + localStorage.getItem('id_token');
                userId = JSON.parse(localStorage.getItem('profile')).email;
            }
            var payload = {
                userId : userId
            };
            var body = { method: 'POST',
                headers: {
                    Authorization : authorization,
                    'Content-type' : 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body : JSON.stringify(payload)
            };

            return fetch(_this.mainUrl + '/genericHeartRateService', body)
                .then(function (response) {
                    if(response.ok)
                        return response.json();
                }).then(function (json) {
                    var dataObjects = _this.storage.readData('TrainingHR', userId)
                        .then(function (res) {
                            console.log(res);
                            return res;
                        }).then(function (res) {
                            var data = [];
                            for (let i = 0; i < json.length; i++){
                                let dataPoint = {
                                    'type' : json[i].category.coding[0].display,
                                    'unit' : 'bpm',
                                    'timestamp' : json[i].effectiveDateTime,
                                    'applicationID' : 'third_party',
                                    'values': [],
                                    'userID' : json[i].subject.display
                                };
                                for (let j = 0; j < json[i].component.length; j++) {
                                    var value = {
                                        'type' : 'pulse',
                                        'value' : json[i].component[j].valueQuantity.value,
                                        'valueTimeStamp' : json[i].component[j].valueDateTime
                                    };
                                    if (json[i].component[j].valueQuantity.valueString) {
                                        value.valueString = json[i].component[j].valueQuantity.valueString;
                                    }
                                    dataPoint.values.push(value);

                                }
                                data.push(dataPoint);
                            }
                            _this.storage.insertData(data);
                        });
                    return Promise.resolve({status : 'success', message: 'Successfully updated heart rate data'});
            })
        },

        loadStepData : function (id_token, userId) {
            var _this = this;
            if (id_token && userId) {
                var authorization = 'Bearer ' + id_token;
            } else {
                var authorization = 'Bearer ' + localStorage.getItem('id_token');
                userId = JSON.parse(localStorage.getItem('profile')).email;
            }
            var payload = {
                userId : userId
            };
            var body = { method: 'POST',
                headers: {
                    Authorization : authorization,
                    'Content-type' : 'application/json'
                },
                mode: 'cors',
                cache: 'default',
                body : JSON.stringify(payload)
            };
            return fetch(_this.mainUrl + '/genericStepDataService', body)
                .then(function (response) {
                    if(response.ok)
                        return response.json();
                }).then(function (json) {
                    console.log(json);
                var dataObjects = _this.storage.readData('Step Tracking', userId)
                    .then(function (res) {
                        console.log(res);
                        return res;
                    }).then(function (res) {
                        var data = [];
                        for (let i = 0; i < json.length; i++){
                            let dataPoint = {
                                'type' : json[i].category.coding[0].display,
                                'unit' : null,
                                'timestamp' : json[i].effectiveDateTime,
                                'applicationID' : 'third_party',
                                'values': [],
                                'userID' : json[i].subject.display
                            };
                            for (let j = 0; j < json[i].component.length; j++) {
                                var value = {
                                    'type' : json[i].component[j].code.coding[0].display,
                                    'value' : json[i].component[j].valueQuantity.value,
                                    'valueTimeStamp' : json[i].component[j].valueDateTime
                                };
                                if (json[i].component[j].valueQuantity.valueString) {
                                    value.valueString = json[i].component[j].valueQuantity.valueString;
                                }
                                dataPoint.values.push(value);

                            }
                            data.push(dataPoint);
                        }
                        _this.storage.insertData(data);
                    });
                    return Promise.resolve({status : 'success' , message : 'Successfully updated step data'});
                })

        }
    };

    return DataLoader;
});
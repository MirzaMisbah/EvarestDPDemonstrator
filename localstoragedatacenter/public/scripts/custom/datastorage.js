/*
 * This file is a main part of the WebDataCenter infrastructure and handles all database operations in the background.
 * @author: Mirco Pyrtek on 19.04.2017
 *
 */
'use strict';

define(function (require) {

    const PouchDB = require('pouchdb');
    const $ = require('jquery');
    const privateMethods = {};


    /**
     * @constructor
     *
     * @property {PouchDB} userDB       The database storing all user information.
     * @property {PouchDB} settingsDB   The database storing all settings for the service applications
     * @property {PouchDB} peraonalData The database storing all data about the users.
     */
    function DataStorage() {
        this.userDB = new PouchDB('UserDB');
        this.settingsDB = new PouchDB('SettingsDB');
        this.personalData = new PouchDB('DataDB');
    }

    DataStorage.prototype = {


        /**
         * Returns the user profile for a specific userID.
         * @param {string} userID   The UserID of the current user.
         */
        getUserProfile: function (userID) {
            return this.userDB.get(userID)
                .catch(function (err) {
                    return null;
                })
        },

        /**
         * Set a profile within the userDB for a specific userID
         * @param {string} userID   The UserID of the current user.
         * @param {object} profile  The new profile information.
         * @return {Promise}
         */
        setUserProfile: function (userID, profile) {
            profile._id = userID;
            return this.userDB.put(profile);
        },

        /**
         * Returns the known hosts.
         * @return {Promise}
         */
        getKnownHosts: function () {
            return this.settingsDB.allDocs();
        },

        /**
         * Reformats the output of .getKnownHosts()
         * @param {object} documents    The documents returned by the .getKnownHosts() method.
         * @param {string} userID       The UserID of the current user.
         * @return {array}
         */
        extractKnownHosts: function (documents, userID) {
            const res = [];
            for (let i = 0; i < documents.rows.length; i++) {
                let current = documents.rows[i].id.split('|');
                if (userID) {
                    if (current[1] && (current[1] === userID)) {
                        res.push(current[0]);
                    }
                } else {
                    res.push(current[0]);
                }
            }
            return res;
        },

        /**
         * Returns the settings for a specific host stored in the local database.
         * @param {string} hostName   The name of the host.
         * @param {string} userID     The UserID of the current user.
         */
        getSettingsOfHost: function (hostName, userID) {
            return this.settingsDB.get(hostName + '|' + userID);
        },


        /**
         * Inserts a new host into the settings database.
         * @param {string} hostName   The name of the new host.
         * @param {string} userID     The UserID of the current user.
         * @param {string} initialSetting     Initial setting as true or false.
         * @return {Promise}
         */
        insertNewHost: function (hostName, userID, initialSetting) {
            return this.settingsDB.put({
                _id: hostName + '|' + userID,
                host: hostName,
                userID: userID,
                methods: {
                    create: initialSetting,
                    read: initialSetting,
                    update: initialSetting,
                    delete: initialSetting
                }
            });
        },

        /**
         * Updates the method allowed status of specific user and hostname.
         * @param {string} host       The name of the host.
         * @param {string} userID     The UserID of the current user.
         * @param {string} method     The name of the method that needs to be updated.
         * @param {boolean} setting   The new setting for the current method.
         */
        setMethodOfHost: function (host, userID, method, setting) {
            const db = this.settingsDB;
            return db.get(host + '|' + userID)
                .catch(function (err) {
                    return {
                        _id: hostName + '|' + userID,
                        host: hostName,
                        userID: userID,
                        methods: {
                            create: false,
                            read: false,
                            update: false,
                            delete: false
                        }
                    }
                })
                .then(function (doc) {
                    doc.methods[method] = setting;
                    return db.put(doc);
                });
        },

        readData: function (dataType, userId) {
            return this.personalData.get(dataType + '|' + userId)
                .catch(function (err) {
                    return {
                        _id: dataType + '|' + userId,
                        dataObjects: []
                    }
                });
        },

        /**
         * Deletes all data objects with a specific datatype and userID.
         * @param {string} dataType   The data type that has to be deleted.
         * @param {string} userID     The UserID of the current user.
         */
        deleteObjectByDataType: function (dataType, userID) {
            const that = this;
            return this.readData(dataType, userID)
                .then(function (doc) {
                    const response = doc;
                    const id = dataType + '|' + userID;
                    if (doc.dataObjects.length > 0) {
                        that.personalData.remove(doc);
                    }
                    return response;
                });
        },


        /**
         * Inserts new data objects into the personal data database.
         * @param {array} dataObjects   The data objects that need to be inserted.
         */
        insertData: function (dataObjects) {
            const that = this;
            if (dataObjects.length > 0) {
                const id = dataObjects[0].type + '|' + dataObjects[0].userID;
                const dataType = dataObjects[0].type;
                const userID = dataObjects[0].userID;
                return that.readData(dataType, userID)
                    .then(function (doc) {
                        const response = {
                            'status': 'success',
                            'message': null,
                            'error': null,
                            doc: doc,
                            duplicates: [],
                            insertedValues: [],
                            type: null
                        };
                        if (dataObjects.length > 0) {
                            const type = dataObjects[0].type;
                            const userID = dataObjects[0].userID;
                            for (let i = 0; i < dataObjects.length; i++) {
                                if (dataObjects[i].type !== type || dataObjects[i].userID !== userID) {
                                    response.status = 'failure';
                                    response.error = response.message = 'Please only send data of same user and type';
                                    return Promise.resolve(response);
                                }
                            }
                        } else {
                            response.status = 'success';
                            response.message = 'No update needed';
                            return Promise.resolve(response);
                        }
                        response._id = id;
                        var updates = [];
                        for (let i = 0; i < dataObjects.length; i++) {
                            var contains = privateMethods.contains(doc.dataObjects, dataObjects[i]);
                            if (contains) {
                                if (contains.status === 'changed') {
                                    console.log('found changed');
                                    console.log(contains);
                                    var args = {
                                        oldObject: doc.dataObjects[contains.index],
                                        newObject: $.extend(true, {}, dataObjects[i])
                                    };
                                    updates.push(args);
                                }
                                response.duplicates.push(dataObjects.splice(i, 1));
                                --i;
                            } else {
                                continue;
                            }
                        }
                        response.insertedValues = dataObjects;
                        var prom = null;
                        if (updates.length > 0) {
                            prom = that.updateManyDataObjects(dataType, userID, updates);
                        }
                        if (dataObjects.length > 0) {
                            response.status = 'success';
                            response.message = 'Ready to insert';
                            return Promise.all(updates)
                                .then(function () {
                                    return Promise.resolve(response);
                                })
                        } else {
                            response.status = 'success';
                            response.message = 'No update needed';
                            return Promise.all(updates)
                                .then(function () {
                                    return Promise.resolve(response);
                                })
                        }
                    })
                    .then(function (res) {
                        if (res.status === 'success') {
                            if (res.message === 'Ready to insert') {
                                const id = res._id;
                                for (let i = 0; i < dataObjects.length; i++) {
                                    res.doc.dataObjects.push(dataObjects[i]);
                                }
                                res.doc._id = id;
                                that.personalData.put(res.doc);
                                res.message = 'Successfully inserted';
                            }
                        }
                        return Promise.resolve(res);
                    });
            }
        },

        /**
         * Updates a specific data object within the database.
         * @param {string} dataType   Type of the data object that needs to be updated.
         * @param {string} userID     The UserID of the current user.
         * @param {object} oldData    The old data object.
         * @param {object} newData    The new data object.
         */
        updateDataObject: function (dataType, userID, oldData, newData) {
            const id = dataType + '|' + userID;
            const response = {};
            const that = this;
            return this.personalData.get(id)
                .then(function (doc) {
                    const dataObjects = doc.dataObjects;
                    for (let i = 0; i < dataObjects.length; i++) {
                        if (privateMethods.compare(dataObjects[i], oldData)) {
                            doc.dataObjects[i] = newData;
                            that.personalData.put(doc);
                            response.status = 'success';
                            return Promise.resolve(response)
                        }
                    }
                    response.status = 'failure';
                    response.message = 'Object not existing';
                    return Promise.resolve(response);
                })
        },

        updateManyDataObjects: function (dataType, userID, updates) {
            const id = dataType + '|' + userID;
            const response = {};
            const that = this;
            return this.personalData.get(id)
                .then(function (doc) {
                    const dataObjects = doc.dataObjects;
                    for (let z = 0; z < updates.length; z++) {
                        var oldData = updates[z].oldObject;
                        var newData = updates[z].newObject;
                        for (let i = 0; i < dataObjects.length; i++) {
                            if (privateMethods.compare(dataObjects[i], oldData)) {
                                doc.dataObjects[i] = newData;
                            }
                        }
                    }
                    response.status = 'success';
                    return that.personalData.put(doc)
                        .then(function (res) {
                            return Promise.resolve(response);
                        })
                        .catch(function (res) {
                            response.status = 'failure';
                            response.message = 'Object not existing';
                            return Promise.resolve(response);
                        });
                })
        }
    };

    /*
    Private Methods
     */

    privateMethods.contains = function (collection, object) {
        for (let i = 0; i < collection.length; i++) {
            let dataPoint = collection[i];
            var comparison = privateMethods.compare(dataPoint, object);
            if (comparison == 'changed') {
                return {
                    found: true,
                    status: 'changed',
                    index: i
                };
            }
            if (comparison) {
                return comparison;
            }
        }
        return false;
    };

    privateMethods.compare = function (data1, data2) {
        const keys1 = Object.keys(data1);
        const keys2 = Object.keys(data2);
        const reference = keys1.length > keys2.length ? { keys : keys2, data : data2 } : {keys: keys1, data : data1};
        const comparer = keys1.length > keys2.length ? { keys : keys1, data : data1 } : {keys: keys2, data : data2};
        if (!privateMethods.compareSchemes(reference.keys,  comparer.keys)) {
            return false;
        }
        for (let i = 0; i < reference.keys.length; i++) {
            if (typeof reference.data[reference.keys[i]] == 'object') {
                continue;
            }
            if (reference.data[reference.keys[i]] !== comparer.data[comparer.keys[i]]) {
                return false;
            } else {
                continue;
            }
        }
        if ((reference.keys.indexOf('values') > -1) && (comparer.keys.indexOf('values') > -1)) {
            let values1 = reference.data['values'];
            let values2 = comparer.data['values'];
            if (values1.length === values2.length) {
                for (let j = 0; j < data1['values'].length; j++) {
                    let objectComparison = privateMethods.compare(values1[j], values2[j]);
                    if (!objectComparison) {
                        return 'changed'
                    } else {
                        continue;
                    }
                }
            }
        }
        // TODO test compare of feedbacks
        if (data2['feedback']) {
            var feedbackKeys2 = Object.keys(data2['feedback']);
            if (data1['feedback']) {
                var feedbackKeys1 = Object.keys(data1['feedback']);
                if (feedbackKeys2.length !== feedbackKeys1.length) {
                    return 'changed';
                } else {
                    for (let j = 0; j < feedbackKeys1.length; j++) {
                        if (data1.feedback[feedbackKeys1[j]].length !== data2.feedback[feedbackKeys1[j]].length) {
                            return 'changed';
                        }
                    }
                }
            } else {
                return 'changed';
            }
        }
        return true;
    };

    privateMethods.compareSchemes = function (scheme1, scheme2) {
        var referenceScheme = scheme1.length > scheme2.length ? scheme2 : scheme1;
        var comparedScheme = scheme1.length > scheme2.length ? scheme1 : scheme2;
        for (let i = 0; i < referenceScheme.length; i++) {
            let temp = referenceScheme[i];
            if (!(comparedScheme.indexOf(temp) > -1)) {
                return false;
            } else {
                continue;
            }
        }
        return true;
    };

    return DataStorage;
});

const DatabaseHandler = require('./dataallocation/handler/databasehandler').DatabaseHandler;
const UPeerCommunicationHandler = require('./dataallocation/handler/peercommunicationhandler').UPeerCommunicationHandler;
const BaaSCommunicationHandler = require('./dataallocation/handler/baascommunicationhandler').BaaSCommunicationHandler;
const TENVIdentificationHandler = require('./dataallocation/handler/tenvidentificationhandler').TENVIdentificationHandler;
const model = require('./model');
const Fingerprint2 = require('fingerprintjs2');


class IndexedDBDatabaseHandler extends DatabaseHandler {
    constructor() {
        super();
        this.dataDB = 'data';
        this.modelDB = 'model';
        this.swCompDB = 'swComponent';
        this.sscItemDB = 'sscItem';

        this.dataTable = 'data';
        this.modelTable = 'model';
        this.softwareComponentsTable = 'swComponent';
        this.smartServiceConfigurationTable = 'sscItem';
    }


    /**
     * Creates a new model object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createModel(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Creates a new data object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createData(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }



    /**
     * Creates a new software component object.

     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSoftwareComponent(object){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Creates a new smart service configuration item.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSmartServiceConfiguration(object){
        const _this = this;

        return new Promise(
            function(resolve, reject) {
                if (object.id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.put(object);
                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Returns all cached model item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored model items.
     */
    async getModelItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Returns all cached domain item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored domain items.
     */
    async getDomainItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Returns all cached software item names accessible withing the database.
     * @return {Promise<Array>} The names of the cached software items.
     */
    async getSoftwareItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable]);
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Returns all cached Smart Service Configuration Item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIDs(){
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable]);
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.getAll();

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Reads a new model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readModel(query){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {

                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.modelTable]);
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Updates a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateModel(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }




    /**
     * Reads a new data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readData(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{    
                        var transaction   = database.transaction([_this.dataTable]);
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Reads a new software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSoftwareComponent(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try {
                        var transaction   = database.transaction([_this.softwareComponentsTable]);
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else {
                                resolve(null);
                            }
                        };
                    } catch (e) {
                        resolve(null);
                    }

                };
            }
        );
    }



    /**
     * Reads a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSmartServiceConfiguration(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    // Objectstore does not exist. Nothing to load
                    event.target.transaction.abort();
                    resolve(null);
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable]);
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.get(id);

                        objectRequest.onerror = function(event) {
                            resolve(null);
                        };

                        objectRequest.onsuccess = function(event) {
                            if (objectRequest.result) resolve(objectRequest.result);
                            else resolve(null);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Updates a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateData(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Updates a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSoftwareComponent(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }


    /**
     * Updates a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSmartServiceConfiguration(query, object){
        const _this = this;
        const id = query.ressource;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.put(object);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteData(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.dataDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.dataTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.dataTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.dataTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSoftwareComponent(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.swCompDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.softwareComponentsTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.softwareComponentsTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.softwareComponentsTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteModel(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.modelDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.modelTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.modelTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.modelTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }

    /**
     * Deletes a smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSmartServiceConfiguration(query){
        const id = query.ressource;
        const _this = this;
        return new Promise(
            function(resolve, reject) {
                if (id === undefined) resolve(null);
                var dbRequest = indexedDB.open(_this.sscItemDB);

                dbRequest.onerror = function(event) {
                    resolve(null);
                };

                dbRequest.onupgradeneeded = function(event) {
                    var database    = event.target.result;
                    var objectStore = database.createObjectStore(_this.smartServiceConfigurationTable, {keyPath: "id"});
                };

                dbRequest.onsuccess = function(event) {
                    var database      = event.target.result;
                    try{
                        var transaction   = database.transaction([_this.smartServiceConfigurationTable], 'readwrite');
                        var objectStore   = transaction.objectStore(_this.smartServiceConfigurationTable);
                        var objectRequest = objectStore.delete(id);

                        objectRequest.onerror = function(event) {
                            resolve(false);
                        };

                        objectRequest.onsuccess = function(event) {
                            resolve(true);
                        };
                    } catch (e) {
                        resolve(null);
                    }
                };
            }
        );
    }
}

class WebRTCUPeerCommunicationHandler extends UPeerCommunicationHandler {
    constructor() {
        super();
        this.connectedPeers = {};
        // this dict maintains the list of peers that sent the initial offer. on ICE restart, this peer will try to
        // send the offer again to create connection
        this.initiatedOffer = {};
        // the list of peers that are in webrtc:failed state
        this.failedConn = {};
        // this buffer contains msgs to be sent to the signalling server. if conn to the signalling server fails, the
        // msgs are buffered and on reconnection, sent to the server
        this.bufferSS = [];
        this.rtcConfig = {
            "iceServers": [{ "url": "stun:stun.l.google.com:19302" }]
        };
        this.MSG_TAGS = {
            START: "<START>",
            END: "<END>",
        }
        this.SSCallback = [];


    }

    send(message, I) {

        I.ssConn.send(JSON.stringify(message));
    }
    transfer(targetID, obj) {
        const I = this;
        var returnonfailure = false;
        // already connected to the peer?
        if (this.connectedPeers[targetID]) {
            var sendChannel = this.connectedPeers[targetID].sendChannel;
            if (sendChannel) {
                if (sendChannel.readyState === "open") {// we can only send if the send channel is open
                    try {
                        //sendChannel.send(json);
                        this.sendChunckedToPeer(sendChannel, JSON.stringify(obj)); // add smaller packets for large message
                        this.issueStatusUpdate(this, "PEER MESSAGE SEND" + targetID);
                        return true;
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + sendChannel.readyState);
                    if (returnonfailure)
                        return false;
                    I.connectedPeers[targetID].onSendChannelOpen = function () {
                        I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS " + sendChannel.readyState);
                        I.transfer(targetID, obj);
                    };
                }
            } else {
                I.issueStatusUpdate(I, "send channel is not defined");
            }
        } else {
            // attempt to connect to the peer!
            var peer = this.connectToPeer(this, targetID);

            I.onReady = function () {

                I.transfer(targetID, obj);
            };
            // we creat an offer
            peer.localConnection.createOffer({
                iceRestart: false	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
            }).then(function (offer) {
                I.initiatedOffer[targetID] = true;
                peer.localConnection.setLocalDescription(offer);
                // we forward the offer to the signaling server
                var msg = I.formatServerMsg("offer", I.identificationHandler.getLocalID(), targetID, offer, null);
                I.send(msg, I);

            }, function (error) {
                I.issueStatusUpdate(I, "Encountered an error while creating offer ", error);

            });
        }
    }
    formatServerMsg(m_type, m_from, m_to, m_content, properties) {
        return {
            type: m_type,
            from: m_from,
            length: m_content.length,
            to: m_to,
            content: m_content,
            properties: properties
        };
    }
    setupEventListener() {
        const I = this;
        this.ssConn = new WebSocket('wss://service-tucana.de:9091');
        //this.ssConn = new WebSocket('ws://localhost:9090');
        this.ssConn.onopen = function () {
            if (I.identificationHandler.getLocalID() != null) {
                var msgLogin = I.formatServerMsg("login",
                    I.identificationHandler.getLocalID(),
                    null, "login", I.identificationHandler.getProperties());
                I.send(msgLogin, I);
            }

        };

        this.ssConn.onmessage = function (msg) {
            //console.log("Got message", msg.data);
            var msgObj = JSON.parse(msg.data);
            switch (msgObj.type) {
                case "login":
                    I.handleLogin(I, msgObj.success);
                    break;
                case "offer":
                    I.handleOffer(I, msgObj.offer, msgObj.from);
                    break;
                case "answer":
                    I.handleAnswer(I, msgObj.answer, msgObj.from);
                    break;
                case "candidate":
                    I.handleCandidate(I, msgObj.candidate, msgObj.from);
                    break;
                case "leave":
                    I.handleLeave(I, msgObj.from);
                    break;
                case "greetings":
                    I.issueStatusUpdate(I, "SS connection available");
                    break;
                case "error":
                    I.onSSError(I, msgObj.error);
                    break;
                case "properties":
                    I.SSCallback[msgObj.id](msgObj.content);
                    break;
                default:
                    break;
            }
        };
        this.ssConn.onerror = function (err) {
            console.log("Error in Login to Signaling Server ", err);
        };


    }
    handleCandidate(I, candidate, from) {
        I.issueStatusUpdate(I, "SS candidate" + from);
        var candidateObj = new RTCIceCandidate(candidate);
        if (I.connectedPeers[from] == null) {
            console.log("Received Candidate from not connected user");
            return;
        }
        I.connectedPeers[from].localConnection.addIceCandidate(candidateObj).then(function () {
            // this value is only for debugging
            I.connectedPeers[from].noCand = I.connectedPeers[from].noCand + 1;
            I.connectedPeers[from].ready = true;
            if (I.onReady)
                I.onReady();
        }, function (error) {
            console.log(error);
        });
    }
    handleLeave(I, from) {
        I.issueStatusUpdate(I, "SS LEAVE " + from);
        if (I.connectedPeers[from]) {
            I.connectedPeers[from].localConnection.onicecandidate = null;
            I.connectedPeers[from].localConnection.close();
            delete I.connectedPeers[from];
            if (I.onPeerDisconnected)
                I.onPeerDisconnected(from);
        }
    }
    handleAnswer(I, answer, from) {
        if (from in I.failedConn) {
            I.failedConn[from] = false
        }
        I.issueStatusUpdate(I, "SS Answer " + from);
        // we set the remote description of the channel we previously created to the answer
        I.connectedPeers[from].localConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
    handleOffer(I, offer, peerId) {
        var to_connect = true;
        I.initiatedOffer[peerId] = false;

        var peer;
        if (peerId in I.failedConn) {
            if (I.failedConn[peerId] == true) {
                peer = I.connectedPeers[peerId];

                //set to false again
                I.failedConn[peerId] = false;
                to_connect = false;
            }
        }
        if (to_connect) {
            // we received an offer from a peer we create the RTC connection
            peer = I.connectToPeer(I, peerId);
        }

        I.issueStatusUpdate(I, " SS OFFER " + peerId);
        // we set the connection remote description to the given offer!
        peer.localConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peer.localConnection.createAnswer(function (answer) {
            // we creat an answer and set the channel local description to the answer!
            peer.localConnection.setLocalDescription(answer);
            var msg = I.formatServerMsg("answer", I.identificationHandler.getLocalID(), peerId, answer, null);
            I.send(msg, I);
        }, function (error) {
            I.issueStatusUpdate(I, "create answer: " + error);
        });

    }
    handleLogin(I, success) {
        if (success) {
            I.issueStatusUpdate(I, "SS LOGGED IN");
        } else {
            I.onSSError(I, "Failed to Login");
        }
    }
    onSSError(I, err) {
        console.log(err);
    }
    issueStatusUpdate(I, status) {
        if (I && I.onStatusUpdate) {
            I.onStatusUpdate(status);
        }
        console.log("[PeerCommunication] ", status);
    }
    async handleRequest(req){
        super.handleRequest(req);
    }

    async handleResponse(req,res){
        super.handleResponse(req,res);
    }
    connectToPeer(I, peerId) {
        var peer = I.connectedPeers[peerId] = new Object();
        peer.ready = false;
        peer.noCand = 0;
        // Creating local channel for it
        peer.localConnection = new RTCPeerConnection(this.rtcConfig);
        peer.localConnection.onicecandidate = function (event) {
            if (event.candidate) {
                I.issueStatusUpdate(I, "candidate " + peerId);
                var msg = I.formatServerMsg("candidate", I.identificationHandler.getLocalID(), peerId, event.candidate, null);
                I.send(msg, I);

            }
        };
        peer.localConnection.oniceconnectionstatechange = function (event) {
            I.issueStatusUpdate(I, " PEER CONNECTION STATUS " + peerId + " is " + peer.localConnection.iceConnectionState);
            localStorage.setItem("Connected peer", peerId)

            if(peer.localConnection.iceConnectionState == 'disconnected') {
                var msg = I.formatServerMsg("leave", 
                I.identificationHandler.getLocalID(),
                null, "leave", I.identificationHandler.getProperties());
                I.send(msg, I);
            }
            if (peer.localConnection.iceConnectionState == "connected") {// notify that this peer is connected now!
                if (I.onPeerConnected) {
                    I.onPeerConnected(peerId);
                }
            }
            if (peer.localConnection.iceConnectionState == "failed") {
                I.failedConn[peerId] = true;
                // wait for a small amount of time before initiating ice restart.
                setTimeout(function () {

                    if (peerId in I.initiatedOffer) {
                        if (I.initiatedOffer[peerId]) {
                            peer.localConnection.createOffer({
                                iceRestart: true	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
                            }).then(function (offer) {
                                peer.localConnection.setLocalDescription(offer);
                                var msg = I.formatServerMsg("offer", I.identificationHandler.getLocalID(), peerId, offer, null);
                                I.send(msg, I);
                            }, function (error) {
                                I.issueStatusUpdate(I, "Encountered an error while performing ICE restart ", error);
                            });
                        }
                    }
                }, 1000);
            }
        };

        //  when receiving data
        peer.localConnection.ondatachannel = function (event) {
            peer.receiveChannel = event.channel;
            var receivedData = new Object();
            var recData = "" ;
            peer.receiveChannel.onmessage = function (event) {
                if (event.data === I.MSG_TAGS.START) {
                    receivedData = "";
                }
                else if (event.data !== I.MSG_TAGS.END && event.data !== I.MSG_TAGS.START) {              
                    receivedData += event.data;
                }//TODO TEST with real request and response data
                else{
                    recData = JSON.parse(receivedData);
                    console.log("Complete message received :  " + receivedData);
                }
                
                if (recData.res) {
                    I.handleResponse(recData.req, recData.res);
                    console.log("Response message received :  "+ localStorage.getItem("permission"));
                    
                }
                else if (recData.type == "req") {
                    I.handleRequest(recData);
                    console.log("Request message received :  "+ localStorage.getItem("permission"));
                }

            };
            peer.receiveChannel.onclose = function () {
                I.issueStatusUpdate(I, "PEER RECEIEVE CHANNEL STATUS " + peerId + " CLOSED ");
            };
        };

        peer.sendChannel = peer.localConnection.createDataChannel(peerId + "_channel", {
            reliable: true
        });

        peer.sendChannel.onerror = function (error) {
            I.issueStatusUpdate(I, "error on send channel of peer " + peerId + " " + error);
        };

        peer.sendChannel.onopen = function () {
            I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + peerId + " OPEN ");
            if (I.connectedPeers[peerId].onSendChannelOpen)
                I.connectedPeers[peerId].onSendChannelOpen();
        };

        peer.sendChannel.onclose = function () {
            I.issueStatusUpdate(I, "PEER SEND CHANNEL STATUS: " + peerId + " CLOSED ");
        };
        return peer;

    }
    sendChunckedToPeer(sendChannel, msg){
        const I = this;
        var data = msg;
        var sendMax = data.length;
        var sendValue = 0;
        var curIndex = 0;
        var endIndex = 0;

        var chunkSize = 16384;
        var bufferFullThreshold = 5 * chunkSize;
        var usePolling = true;
        if ( typeof sendChannel.bufferedAmountLowThreshold === 'number') {
            usePolling = false;

            bufferFullThreshold = chunkSize / 2;

            // This is "overcontrol": our high and low thresholds are the same.
            sendChannel.bufferedAmountLowThreshold = bufferFullThreshold;
        }//if

        // Listen for one bufferedamountlow event.
        var listener = function() {
            sendChannel.removeEventListener('bufferedamountlow', listener);
            sendAllData();
        };
        var sendAllData = function() {
            while (sendValue < sendMax) {
                if (sendChannel.bufferedAmount > bufferFullThreshold) {
                    if (usePolling) {
                        setTimeout(sendAllData, 250);
                    } else {
                        sendChannel.addEventListener('bufferedamountlow', listener);
                    }
                    return;
                }
                sendValue += chunkSize;

                endIndex = curIndex + chunkSize > data.length ? data.length : curIndex + chunkSize;
                var msg = data.substring(curIndex, endIndex);
                if (curIndex == 0) {
                    sendChannel.send(I.MSG_TAGS.START);
                }
                sendChannel.send(msg);
                if (endIndex >= data.length) {
                    sendChannel.send(I.MSG_TAGS.END);
                }
                curIndex = endIndex;
            }
        };
        setTimeout(sendAllData, 0);
    }


    async getFilteredPeerIds(properties) {
        const I = this;
        var msg = I.formatServerMsg("properties", this.identificationHandler.getLocalID(), null, {id : I.SSCallback.length, properties:properties});
        return new Promise((resolve, reject) => {
            setTimeout(() => {            
            I.send(msg, I);
            I.SSCallback.push(function(list) {
                console.log("Filterd Ids : ",list);
                resolve(list);})
            
        
        })}, 500);

    }
}

class RESTAPIBaaSCommunicationHandler extends BaaSCommunicationHandler {
    constructor() {
        super();
    }

    /**
     * This function can be used to fetch software items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastSBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/javascript'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.text();
                    }).then(jsCode => {
                        return {
                            req : crudOperation,
                            res : {success : true, status: 'provided', message: 'Operation was successfully executed.', response : new model.SoftwareItem(ressource, jsCode)}
                        };
                }).catch(error => {
                    return {
                        req : crudOperation,
                        res : {success : false, status: 'failed', message: 'Failed broadcast request.'}
                    };
                })
            );
        }
        return await Promise.all(promises);
    }

    /**
     * This function can be used to fetch domain items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastDBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };

            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                        return {success : true, status: 'provided', message: 'Operation was successfully executed.', response : new model.DomainItem(ressource, jsonObject)};
                    })
            );
        }
        return await Promise.all(promises);
    }

    /**
     * This function can be used to fetch smart service configuration items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastSSCBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                        return {success : true, status: 'provided', message: 'Operation was successfully executed.', response : new model.SmartServiceConfigurationItem(ressource, jsonObject.version, jsonObject.configuration, jsonObject.context)};
                    })
            );
        }
        return await Promise.all(promises);
    }

    /**
     * This function can be used to fetch model items via REST API.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastMBaaS(crudOperation) {
        const targets = crudOperation.getBroadcastConfiguration().getTargets();
        const promises = [];
        for (let ressource of targets) {
            const options = {
                'headers' : {
                    'Accept' : 'application/json'
                }
            };
            promises.push(
                fetch(ressource, options)
                    .then(response => {
                        return response.json();
                    }) .then(jsonObject => {
                        return {success : true, status: 'provided', message: 'Operation was successfully executed.', response : new model.ModelItem(ressource, jsonObject)};
                    })
            );
        }
        return await Promise.all(promises);
    }
}
class Browser extends TENVIdentificationHandler {
    constructor() {
        super();
    }
    getLocalID() {
        return true;
    }
    getProperties() {
        return true;
    }
    getName() {
        return true;
    }
    getType() {
        return true;
    }

}

class BrowserFingerprintIdentificationHandler extends TENVIdentificationHandler {


    /**
     * Creates a dynamic login form and stores the given information(Name, Keywords, commercial use...) in the localStorage
     * and uses Fingerprintjs2 to create a unique ID of the user. If the user already has an id
     * in the localStorage the login form will not pop up.
     * @param signUpFormId
     * @param logoutButtonId
     */

    constructor(signUpFormId, logoutButtonId) {
        super();

        var signUpForm = document.getElementById(signUpFormId);
        var logoutButton = document.getElementById(logoutButtonId);
        var span = document.createElement("SPAN");

        span.className = "close";
        span.title = "Close Modal";
        span.innerHTML = '&times';
        span.onclick = function () {
            signUpForm.style.display = 'none';
            localStorage.setItem("id", null);

        };

        signUpForm.appendChild(span);

        var form = document.createElement("form");
        form.className = "modal-content";

        var container = document.createElement("id");
        container.className = "container";
        signUpForm.appendChild(form);


        var container = document.createElement("div");
        container.className = "container";
        container.id = "signUpContainer";
        form.appendChild(container);

        signUpForm.style.display = 'block';

        function createCheckbox(labelContent, id, container) {
            var d = document.createElement("div");
            var v = document.createElement("input");
            v.type = "checkbox";
            v.id = id;

            var label = document.createElement('label');
            label.htmlFor = "id";
            label.appendChild(document.createTextNode(labelContent));
            d.appendChild(v);
            d.appendChild(label);
            container.appendChild(d);

        }

        function createTextField(id, container, placeholder, labelContent) {
            var keywordsFieldLabel = document.createElement("label");
            keywordsFieldLabel.innerText = "\n" + labelContent;

            var keywordField = document.createElement("input");
            keywordField.type = "text";
            keywordField.id = id;
            keywordField.placeholder = placeholder;

            container.appendChild(keywordsFieldLabel);
            container.appendChild(keywordField);
        }



        var h1 = document.createElement("h4");
        h1.innerText = "Login";
        container.appendChild(h1);


        var p = document.createElement("P");
        p.innerText = "Become part of our community!";
        container.appendChild(p);


        createTextField("nameField", container, "Name", "Name");
        //createTextField("keywordField", container, "Enter some Keywords", "Keywords");
        //createCheckbox("Commercial use", "commercialBox", container);
        //createCheckbox("Content Offering", "contentOffering", container);
        createCheckbox("Chocolate Producer", "producer", container);
        createCheckbox("SAS Provider", "provider", container);
        createCheckbox("Guest", "guest", container);


        var cancelLabel = document.createElement('label');
        cancelLabel.innerText = "Cancel";
        var cancelButton = document.createElement("button");
        cancelButton.onclick = "document.getElementById('" + signUpFormId + "').style.display='none'";
        cancelButton.type = "button";
        cancelButton.className = "cancelbtn submit-button";
        cancelButton.appendChild(cancelLabel);

        var submitLabel = document.createElement('label');
        submitLabel.innerText = "Submit";
        var submitButton = document.createElement("button");
        submitButton.onclick = "document.getElementById('" + signUpFormId + "').style.display='none'";
        submitButton.id = "submitButton";
        submitButton.className = "submit-button";
        submitButton.appendChild(submitLabel);

        var buttonDiv = document.createElement("div");
        buttonDiv.className = "clearfix";

        buttonDiv.appendChild(cancelButton);
        buttonDiv.appendChild(submitButton);
        container.appendChild(buttonDiv);


        this.localId = localStorage.getItem("id");
        this.name = localStorage.getItem("name");
        this.producer = localStorage.getItem("producer");
        this.provider = localStorage.getItem("provider");
        this.guest = localStorage.getItem("guest");


        logoutButton.addEventListener("click", function (e) {
            localStorage.clear();
            this.localId = null;
            localStorage.setItem("id", null);
            location.reload(true);

        });

        //take a fingerprint and store it in localStorage
        Fingerprint2.get(function (components) {
            let localId = Fingerprint2.x64hash128(components.map(function (pair) { // create an ID from the hashed components
                return pair.value;
            }).join(), 31);

            localStorage.setItem("id_tmp", localId);

        });


        if (localStorage.getItem("id")) {

            console.log("User already logged in with id: " + localStorage.getItem("id"));

            document.getElementById(signUpFormId).style.display = 'none';

        } else {

            //store the given information in the localStorage when submitButton is pressed
           submitButton.addEventListener("click", function (e) {


            this.name = document.getElementById("nameField").value;
            localStorage.setItem("name", this.name);
            
            if (this.name == '') {
                alert('you must gave your name to proceed');
                return
            }

                
                //this.keywords = document.getElementById("keywordField").value;
                //localStorage.setItem("keywords", this.keywords);
              /*  if (document.getElementById("modelOffering").checked) {
                    localStorage.setItem("modelOffering", true);
                    this.modelOffering = true;
                } else {
                    localStorage.setItem("modelOffering", false);
                    this.modelOffering = false;
                }
                if (document.getElementById("contentOffering").checked) {
                    localStorage.setItem("contentOffering", true);
                    this.contentOffering = true;
                } else {
                    localStorage.setItem("contentOffering", false);
                    this.contentOffering = false;
                }
                if (document.getElementById("softwareOffering").checked) {
                    localStorage.setItem("softwareOffering", true);
                    this.softwareOffering = true;
                } else {
                    localStorage.setItem("softwareOffering", false);
                    this.softwareOffering = false;
                }
                if (document.getElementById("commercialBox").checked) {
                    localStorage.setItem("commercial", true);
                    this.commercial = true;
                }*/ 
                this.producer = false;
                this.provider = false;
                this.guest = false;
                if (document.getElementById("producer").checked) {
                    localStorage.setItem("producer", true);
                    localStorage.setItem("role", true);
                    this.role = true;
                    this.producer = true;
                } 
                else {
                    localStorage.setItem("producer", false);
                }

                if (document.getElementById("provider").checked) {
                    localStorage.setItem("provider", true);
                    localStorage.setItem("role", true);
                    this.role = true;
                    this.provider = true;
                } 
                else {
                    localStorage.setItem("provider", false);
                }

                if (document.getElementById("guest").checked) {
                    localStorage.setItem("producer", true);
                    localStorage.setItem("guest", false);
                    localStorage.setItem("role", true);
                    this.role = true;
                    this.producer = true;
                } 
                else {
                    localStorage.setItem("guest", false);
                }


                if (this.producer == false && this.provider == false && this.guest == false) {
                    alert("You can only seek help but can't use any service as you did'nt choose any role!");
                    var answer = window.confirm("You want to choose Role?")
                    if (answer) {
                        return
                    }
                    else{
                        localStorage.setItem("role", false);
                        this.role = false;
                    }
                }
                
                this.localId = localStorage.getItem("id_tmp");
                localStorage.setItem("id", this.localId);
                location.reload(true);
                /*window.close();
                if (this.producer == true) {
                    window.open("../EVAREST-HMI/html/main.html?role="+this.name);
                }
                if (this.provider == true && this.guest == false) {
                    window.open("../EVAREST-HMI/html/main10.html?role="+this.name);
                }
                if (this.guest == true) {
                    window.open("../EVAREST-HMI/html/main20.html?role="+this.name);
                }*/



            });

            /*show register form*/
            signUpForm.style.display = 'block';
            


        }
        this.properties = {
            localId: this.localId,
            commercial: this.producer,
            software: this.provider,
            content: this.guest,
            model: 'true',
            keywords: "k",
            name: "n"

        }
        console.log("Properties at login");
        console.log(this.properties);
    }

    /**
     * Returns the local id of the peer.
     * @return {String}: The local id of the peer.
     */
    getLocalID() {
        return this.localId;
    }

    /**
     * Returns the properties of the Peer.
     * @return {Array}: All properties of the peer.
     */
    getProperties() {
        return this.properties;
    }

    /**
     * Returns the name of the peer.
     * @return {String}: The name of the peer.
     */
    getName() {
        return this.name;
    }

    /**
     * Returns the type of the peer.
     * @return {String}: The type of the peer.
     */
    getType() {
        return this.commercial;
    }

    /**
     * Returns the geographic information of the peer.
     * @return {String}: The geographic information of the peer.
     */
    async getGeography() {

        var result = {};

        function reverseGeocode(latitude, longitude, res) {


            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "https://us1.locationiq.com/v1/reverse.php?key=95a3c547a4d595&lat=" + latitude + "&lon=" + longitude + "&format=json",
                "method": "GET"
            }

            return $.ajax(settings).done(function (response) {

                res();
            });

        }

        let promise = new Promise(function (res, rej) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    result.geo = reverseGeocode(position.coords.latitude, position.coords.longitude, res);
                })
            }
        );

        await promise;

        console.log(result.geo.responseJSON);

        return result.geo;
    }

    /**
     * Returns the software offering of the peer.
     * @return {String}: The software offering of the peer.
     */
    getSoftwareOffering() {
        return this.softwareOffering;
    }

    /**
     * Returns the model offering of the peer.
     * @return {String}: The model offering of the peer.
     */
    getModelOffering() {
        return this.modelOffering;
    }

    /**
     * Returns the content offering of the peer.
     * @return {String}: The content offering of the peer.
     */
    getContentOffering() {
        return this.contentOffering;
    }

    /**
     * Returns the keywords of the peer.
     * @return {Array}: The keywords of the peer.
     */
    getKeywords() {
        return this.keywords;
    }
}


module.exports.DOMUIAdapter = require('./coreplatform/ui_adapters/uiAdapter').domAdapter;
module.exports.BrowserFingerprintIdentificationHandler = BrowserFingerprintIdentificationHandler;
module.exports.Browser = Browser;
module.exports.IndexedDBDatabaseHandler = IndexedDBDatabaseHandler;
module.exports.RESTAPIBaaSCommunicationHandler = RESTAPIBaaSCommunicationHandler;
module.exports.WebRTCUPeerCommunicationHandler = WebRTCUPeerCommunicationHandler;


const DatabaseHandler = require('./dataallocation/handler/databasehandler').DatabaseHandler;
const UPeerCommunicationHandler = require('./dataallocation/handler/peercommunicationhandler').UPeerCommunicationHandler;
const BaaSCommunicationHandler = require('./dataallocation/handler/baascommunicationhandler').BaaSCommunicationHandler;
const TENVIdentificationHandler = require('./dataallocation/handler/tenvidentificationhandler').TENVIdentificationHandler;

// TODO: Revise functionality i.e. are all necessary methods already overwritten?
/*
we can make use of Jsdata library for example here to
store/read/update/delete the data using localstorage
*/

class IndexedDBDatabaseHandler extends DatabaseHandler {
    constructor() {
        super();
        //TODO implement the database adapter.
    }


     /**
     * Creates a new model object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createModel(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object);
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }


      /**
     * Creates a new data object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createData(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }



    /**
     * Creates a new software component object.

     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSoftwareComponent(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }


    /**
     * Creates a new smart service configuration item.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSmartServiceConfiguration(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object);
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }


    /**
     * Returns all cached model item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored model items.
     */
    async getModelItemIDs(DBName, table){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.getAll();
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('No model found'));
              };
            };
          }
        );
      }
      
      /**
     * Returns all cached domain item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored domain items.
     */
    async getDomainItemIDs(DBName, table){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.getAll();
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('No data found'));
              };
            };
          }
        );
      }

    /**
     * Returns all cached software item names accessible withing the database.
     * @return {Promise<Array>} The names of the cached software items.
     */
    async getSoftwareItemIDs(DBName, table){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              // Objectstore does not exist. Nothing to load
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.getAll();
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('No software item found'));
              };
            };
          }
        );
      }


    /**
     * Returns all cached Smart Service Configuration Item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIDs(DBName, table){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.getAll();
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('No object found'));
              };
            };
          }
        );
      }


    /**
     * Reads a new model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readModel(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.get(id);
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
              };
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
    async _updateModel(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }




    /**
     * Reads a new data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readData(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              // Objectstore does not exist. Nothing to load
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.get(id);
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('object not found'));
              };
            };
          }
        );
      }

    /**
     * Reads a new software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSoftwareComponent(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              // Objectstore does not exist. Nothing to load
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.get(id);
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('object not found'));
              };
            };
          }
        );
      }



    /**
     * Reads a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSmartServiceConfiguration(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("Error text"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              // Objectstore does not exist. Nothing to load
              event.target.transaction.abort();
              reject(Error('Not found'));
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table]);
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.get(id);
      
              objectRequest.onerror = function(event) {
                reject(Error('Error text'));
              };
      
              objectRequest.onsuccess = function(event) {
                if (objectRequest.result) resolve(objectRequest.result);
                else reject(Error('object not found'));
              };
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
    async _updateData(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
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
    async _updateSoftwareComponent(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
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
    async _updateSmartServiceConfiguration(DBName, table, object){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.put(object); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }

    /**
     * Deletes a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteData(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.delete(id); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }

    /**
     * Deletes a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSoftwareComponent(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.delete(id); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }

    /**
     * Deletes a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteModel(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.delete(id); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }

    /**
     * Deletes a smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSmartServiceConfiguration(DBName, table, id){
        return new Promise(
          function(resolve, reject) {
            if (object.id === undefined) reject(Error('object has no id.'));
            var dbRequest = indexedDB.open(DBName);
      
            dbRequest.onerror = function(event) {
              reject(Error("IndexedDB database error"));
            };
      
            dbRequest.onupgradeneeded = function(event) {
              var database    = event.target.result;
              var objectStore = database.createObjectStore(table, {keyPath: "id"});
            };
      
            dbRequest.onsuccess = function(event) {
              var database      = event.target.result;
              var transaction   = database.transaction([table], 'readwrite');
              var objectStore   = transaction.objectStore(table);
              var objectRequest = objectStore.delete(id); 
      
              objectRequest.onerror = function(event) {
                reject(false);
              };
      
              objectRequest.onsuccess = function(event) {
                resolve(true);
              };
            };
          }
        );
      }
}

class WebRTCUPeerCommunicationHandler extends UPeerCommunicationHandler {
    constructor(webRTCConfiguration) {
        super();
        this.webRTCConfiguration = webRTCConfiguration;
        // TODO establish the connection to ice servers
    }

    transfer(targetID, json) {
        // TODO Implement the functionality that transfers a json to a target peer
    }

    setupEventListener() {
        // TODO Implement the functionality that sets up all necessary event listeners (including communication with signaling server)
    }

    async getFilteredPeerIds(properties) {
        // TODO Implement the functionality that asks for all accessible peers with the given properties while contacting the signaling server.
    }
}

class RESTAPIBaaSCommunicationHandler extends BaaSCommunicationHandler {
    constructor() {
        super();
    }
}

class BrowserFingerprintIdentificationHandler extends TENVIdentificationHandler {
    // TODO have a look at browser fingerprinting especially canvas fingerprinting as given here https://valve.github.io/fingerprintjs2/
    constructor() {
        super();
    }

    getLocalID() {
        // TODO implement this method for getting unique ids for each peer
    }
}

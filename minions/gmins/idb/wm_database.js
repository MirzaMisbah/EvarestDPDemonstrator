'use strict';
var DB_NAME = "TUCANA";

var idb;

var storeName;  // current store name, should be the same as the logged in user name/email

var interval;   // how often db should be updated in milliseconds

var updateInterval; // reference to the setInterval return value
 
// write to do list
var wTODO = {}; // dictionary, where the key is the email of the peer 
                     // and the value is the queue of values to be inserted!


/**
 * Here is the first function to be executed 
 */ 
function start(p_storeName, p_interval){ 
    storeName = p_storeName;
    interval  = p_interval;
    // we try to open db
    openDatabase();    
}

function sendStartSignal(){
    self.postMessage({operation:'start'});    
    // periodic update
    updateInterval = self.setInterval(update, interval);  
}
/*******************************************************************************************
 * Open request handlers
 *******************************************************************************************/
function onUpgradeNeededHandler(event){
    idb = event.target.result;    
    console.log("onupgradeneeded:", event, "DB: ", idb);
    // for this version we need an object store        
    createObjectStore();   
}
function onReqSuccessHandler(event){
    idb = event.target.result;
    var storeIsThere = idb.objectStoreNames.contains(storeName);
    if(!storeIsThere){
        // object store does not exist, database needs to be upgraded
        console.log("A new object store needs to be created. database is to be upgraded."); 
        console.log("Current database version ", parseInt(idb.version));
        idb.close();
        openDatabase(idb.version + 1);
    }else{
        sendStartSignal();
    }    
}
function onReqErrorHandler(event){
    console.error("open request error event:", event);
    console.error("error code!:", event.target.errorCode);
}

/***
 * if version is given it uses it to upgrade an existing db
 * otherwise it ignores this parameter and opens the latest version
 */
function openDatabase(version){
    
    // send request to open data base, if version is given use it, otherwise ignore it
    var idb_openrequest = !!version? self.indexedDB.open(DB_NAME, version): self.indexedDB.open(DB_NAME);
    
    idb_openrequest.onerror = onReqErrorHandler;    
        
    // when this is called one can start transactions on object stores
    idb_openrequest.onsuccess = onReqSuccessHandler;

    // when a new database is created or version number is upgraded
    // this is the only place we can alter database structure, in it we can create and delete object stores
    idb_openrequest.onupgradeneeded = onUpgradeNeededHandler; 
    
}
/**
 * creates an object store this is must be called only on "onupgradeneeded" event. 
 */
function createObjectStore(){
    var objectStore = idb.createObjectStore(storeName, {
        keyPath : "email"
    });
            
    objectStore.createIndex("email", "email", {
        unique : true
    });
            
    objectStore.transaction.oncomplete = function(event) {
        console.log("[objectStore.transaction.oncomplete]");   
    }; // oncomplete            
}
function stop(){
    if(updateInterval){
        clearInterval(updateInterval);
    }
}

function update(){ 
     //console.time("update");  
     
    
    // we loop through the keys(the emails of our peers that sent us data) in wTODO queue
    Object.keys(wTODO).forEach(function(key){
        var peer = wTODO[key];            


        idb_get(idb, storeName, key, function(dbPeer) {            
             var updateNeeded = false;
             
             // if the database does not have a peer for this key, it means, it is newly added. In this case we'll insert it for the first time.  
             if(!!!dbPeer){ // first time               
                dbPeer = peer;
                updateNeeded = true;                                  
             }else{
             Object.keys(peer).forEach(function(peerkey){              
                    switch(peerkey){   
                       case 'messages':                     
                            let messages = peer['messages'];
                            if(messages.length > 0){
                                if(!!!dbPeer.messages){
                                    dbPeer.messages = [];
                                }                            
                                dbPeer.messages = dbPeer.messages.concat(messages);
                                updateNeeded = true;
                                peer['messages'] = [];
                            }                            
                        break;
                        case 'email':
                        case 'creationTime':
                            //dbPeer[peerkey] = peer[peerkey];
                            break;
                        case 'minions':
                        case 'data':
                           updateNeeded = pushToDic(dbPeer, peer, peerkey);
                           break;           
                        default:
                            console.error("unknown key %s", peerkey);
                     }// switch
                                 
            });// peer loop    
             } 
              if(dbPeer){
                  
                  idb_put(idb, storeName, dbPeer, function() {
                  
                       
                  
                    //  ready = true;
                    //console.log("updated ! "); 
                    
                  });
              }
        
            });// get
       // }// if
    });// dictionary foreach
  
  
    //console.timeEnd("update");
}
function pushToDic(db, mem, key){
    var updateNeeded = false;                              
    if(!!! db[key]){ 
         db[key] = mem[key];   
         updateNeeded = true;                                      
    }else{                      
        Object.keys(mem[key]).forEach(function(subKey){  
//            console.log("merging ", db[key][subKey], mem[key][subKey]);                              
            db[key][subKey] =  merge_objects(db[key][subKey], mem[key][subKey]);          
            updateNeeded = true;   
                                      
        });
    }
    mem[key] = {};   
    return updateNeeded;
}
/***************************************************************
 *  The following functions map to possible indexeddb operations
 ****************************************************************/
function idb_add(db, storeName, objectToAdd, callback) {
    'use strict';
    var transaction = db.transaction(storeName, "readwrite"),
        objStore = transaction.objectStore(storeName),
        request = objStore.add(objectToAdd);
    // object with the same key value must not be present, if you wish to update use put!

    request.onsuccess = function(event) {
        //console.log("[idb_add- request.onsuccess]", event.target.result);
    };
    transaction.oncomplete = function(event) {
        callback();
       // console.log("[idb_add- transaction.oncomplete]", event);
    };
    transaction.onerror = function(error) {
        console.error("[idb_add- transaction.onerror]", error);

    };

}

function idb_delete(db, storeName, objKeyToDel, callback) {
    'use strict';
    var transaction = db.transaction(storeName, "readwrite"),
        objStore = transaction.objectStore(storeName),
        request = objStore.delete(objKeyToDel);

    request.onsuccess = function(event) {
        //console.log("[idb_delete- request.onsuccess]", event);
    };
    transaction.oncomplete = function(event) {
        //console.log("[idb_delete- transaction.oncomplete]", event);
    };
    transaction.onerror = function(error) {
        console.error("[idb_delete- transaction.onerror]", error);

    };
}

function idb_get(db, storeName, objKeyToGet, callback) {
    'use strict';
    var transaction = db.transaction(storeName),
        objStore = transaction.objectStore(storeName),
        request = objStore.get(objKeyToGet);

    request.onsuccess = function(event) {
        //console.log("[idb_get- request.onsuccess]", request.result, event.target.result);
        callback(request.result);
    };
    transaction.oncomplete = function(event) {
       // console.log("[idb_get- transaction.oncomplete]", event);
    };
    transaction.onerror = function(error) {
        console.error("[idb_get- transaction.onerror]", error);

    };
}

function idb_put(db, storeName, objectToPut, callback) {
    'use strict';
    var transaction = db.transaction(storeName, "readwrite"),
        objStore = transaction.objectStore(storeName),
        request = objStore.put(objectToPut);
    // object with the same key value must not be present, if you wish to update use put!

    request.onsuccess = function(event) {
        //console.log("[idb_put- request.onsuccess]", event);
    };
    transaction.oncomplete = function(event) {
        callback();
        //console.log("[idb_put- transaction.oncomplete]", event);
    };
    transaction.onerror = function(error) {
        console.error("[idb_put- transaction.onerror]", error);

    };
}

function idb_getAll(db, storeName, callback) {
    var transaction = db.transaction(storeName);
    var objStore = transaction.objectStore(storeName);
    var objects = {};
    objStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            objects[cursor.key] = cursor.value;
            cursor.continue();
        } else {
            callback(objects);
        }
    };
}
function generate_peer_obj(key) {
    var obj = new Object();
    // TBD obj.name = "test";
    obj.email       = key;
    obj.data        = {};
    obj.messages    = [];
    obj.minions     = {};
    obj.creationTime = new Date().getTime();
    return obj;
}

/***
 * 
 * @param {Object} event
 *                  data
 *                      operation: (get, put) 
 *                      subMinion: tbd
 *                      key: email
 *                      value: (not null in case of put)
 *                          
 */
self.onmessage = function(event) {   
   var message = event.data; 
   switch(message.operation){
       case 'start':
           start(message.storeName, message.interval);   
           break;
       case 'stop':
           stop();
           break;
       case 'get':
            var key = message.key;
            if(key === 'all'){                
                idb_getAll(idb, storeName, function(peers){                   
                   self.postMessage({
                      operation: 'get',
                      key: 'all',
                      result: peers 
                   }); 
                });
            }
            // TODO: implement
       break;
       case 'put':      // this is for data only! 
            var key = message.key;
            switch (message.group){
                case 'messages':                    
                    if(!!!wTODO[key]){
                        wTODO[key] = {};
                    }
                    if(!!!wTODO[key].messages){ // if messages for this key is not defined 
                        wTODO[key].messages = [];
                    }
                    wTODO[key].messages.push(message.value);
                    break;  
                case 'peer':                
                    if(!(key in wTODO)){
                        wTODO[key] = generate_peer_obj(key);                        
                    }      
                    break;
                case 'minions': // TODO: BUG: the initialization order when db is freshly created!                
                   if(!!!wTODO[key]){ 
                        wTODO[key] = {};
                    }                    
                    if(!!!wTODO[key].minions){
                         wTODO[key].minions = {};
                    }if(!!!wTODO[key].minions[message.value.name]){
                        wTODO[key].minions[message.value.name] = {};
                    }
                    wTODO[key][message.group][message.value.name] = merge_objects(wTODO[key][message.group][message.value.name],  message.value);
                               
                break;
                case 'data':              
                  //  var subgroup = message.value.name;
                     if(!!!wTODO[key]){
                        wTODO[key] = {};
                    }                    
                    if(!!!wTODO[key].minions){
                         wTODO[key].minions = {};
                    }
                    wTODO[key][message.group] = merge_objects(wTODO[key][message.group],  message.value);                    
                 break;
                    
            }    
       break;
       
   } 
};

/**
 * merges the second object into the first
 * @param {Object} a
 * @param {Object} b
 */
function merge_objects(a, b){    
    if(!!!a)   {
        return b;
    }    
    if(typeof(a) !== 'object' && typeof(b) !== 'object'){
        return b;        
    }
    if(Array.isArray(a) && Array.isArray(b)){
        return a.concat(b);
    }
    Object.keys(b).forEach(function(key){
        a[key] = merge_objects(a[key], b[key]);
    });    
    return a;   
}

'use strict';
/**
 *
 * @param {Object} p_wminionDB the database subMinion
 * @param {Object} obj {name: <sensorname>, timestamp: ..., value: {...}}
 */
function db_save_data(p_wminionDB, p_email, p_minionName, p_collection, p_type, p_value) {    
    var obj = {
        operation : 'put',        
        key : p_email,
        group: 'data',
        value:{}      
    };
    obj.value[p_minionName] ={
        type: p_type,
        laps: {} 
    };  
    obj.value[p_minionName].laps[p_collection] = p_value instanceof Array? p_value: [p_value]; // in case of one value]    
    p_wminionDB.postMessage(obj);
};

/**
 * 
 * @param {Object} p_wminionDB
 * @param {Object} p_email
 * @param {Object} p_sent boolean true sent/ false received
 * @param {Object} p_text
 */
function db_save_message(p_wminionDB, p_email, p_sent, p_text){   
    var obj = {
        operation : 'put',        
        key : p_email,
        group: 'messages',
        value: {
            timestamp: new Date().getTime(),
            direction:  p_sent? 'to':'from',
            text: p_text.trim()
        }
    };  
    p_wminionDB.postMessage(obj);
    
}
function db_save_peer(p_wminionDB, p_email){   
    var obj = {
        operation : 'put',        
        key : p_email,
        group: 'peer'      
    };  
    p_wminionDB.postMessage(obj);
    
}

function db_get_everything(p_wminionDB){
       var obj = {
           operation : 'get', 
           key: 'all'
       };
      p_wminionDB.postMessage(obj);
}
/**
 * 
 * @param {Object} p_wminionDB
 * @param {Object} email logged in user email address
 * @param {Object} updateInterval in milliseconds
 */
function db_start(p_wminionDB, email, updateInterval){
       var obj = {
           operation : 'start', 
           storeName: email,
           interval: updateInterval
       };
       p_wminionDB.postMessage(obj);
}
function db_stop(p_wminionDB){
       var obj = {
           operation : 'stop'
       };
       p_wminionDB.postMessage(obj);
}
function db_save_received_minion(p_wminionDB, p_email, p_name, p_type, p_owner, p_code, numberOfInputs=1, partner=null){
    console.time('db_save_received_minion');
    var obj = {
        operation: 'put',  
        key : p_email,
        group: 'minions',
        value: {
            "name": p_name,
            "type": p_type,
            "owner": p_owner,
            "code": p_code,
            "receivedat": new Date().getTime(),
            'inputs' : numberOfInputs
        }        
    };
    if (partner)
        obj.value.partner = partner;

    p_wminionDB.postMessage(obj);
    console.timeEnd('db_save_received_minion');
}
function db_save_sent_minion(p_wminionDB, p_to, p_name, p_type){
    console.time('db_save_sent_minion');
    var obj = {
        operation: 'put',  
        key : p_to,
        group: 'minions',
        value: {
            "name": p_name,
            "type": p_type,       
            "sentat": new Date().getTime()           
        }        
    };
    p_wminionDB.postMessage(obj);
    console.timeEnd('db_save_sent_minion');
}

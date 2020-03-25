// communicationHelper defined in main.js
function init_communication() { // TODO: move it
    
    communicationHelper = new CommunicationHelper(app.SIG_SERVER, app.authorizationManager.getProfile().email, app.rtcConfig);
    communicationHelper.onPeerConnected     = onPeerConn;
    communicationHelper.onPeerDisconnected  = onPeerDisconn;
    communicationHelper.onMessage           = onPeerMessage;
    communicationHelper.onSensor            = onPeerData;
    communicationHelper.onBasicMinion       = onPeerBminion;
    communicationHelper.onWorkerMinion      = onPeerWminion;
    communicationHelper.onStartLap        = onPeerStartLap;
    communicationHelper.onStopLap         = onPeerStopLap;
}
function onPeerConn(id) {
    // select this user 
    var contact = new_contact(id);
    ui_online_contact(contact);
}
function onPeerDisconn(id) {
    var contact = Contact.findContact(contacts, id);
    ui_offline_contact(contact);
}
function onPeerMessage(id, msg) {    
    var contact = Contact.findContact(contacts, id);    
    // save to db
    db_save_message(dbMinion, id, false, msg);      
    // update message array
    contact_append_message(contact, false, new Date().getTime(), msg);
    // update message count!            
    ui_new_msg_contact(contact);
    // refresh table
    refresh_message_table(contact);
}
function onPeerData(email, value){ // TODO: rename!
    var contact = Contact.findContact(contacts, email);    
    var foundChannel = contact.dataChannels.values.find(
        channel => channel.name === value.lap &&  channel.creator === value.name
    );
    if(foundChannel){
        foundChannel.concat(value.values);
    }else{
        contact.dataChannels.push(
            new DataChannel(value.lap, value.values, value.name, null, contact.email, 'streaming')
        );
    }
}
function onPeerWminion(email, value){
    console.log("onPeerWminion");
    var contact = Contact.findContact(contacts, email);    
    console.error('NOT_IMPLEMENTED');
}
function onPeerBminion(email, minion){
    console.log("onPeerBminion");

  
 var contact = Contact.findContact(contacts, email);
 app.minionManager.storeNewMinion(email, app.authorizationManager.getProfile().email, minion);
}

function onPeerStartLap(email, value){
    console.log("onPeerStartLap", value);
    deactivate_sender();

    window.macroCommunication = {lapName : value.name};

    app.minionManager.startMacro('nPotato Device');

    activate_sender(email, value.name, value.interval);
    
    
}
function onPeerStopLap(email, value){     
    console.log("onPeerStopLap", value);
    app.minionManager.stopMacro('nPotato Device');

    deactivate_sender();
}

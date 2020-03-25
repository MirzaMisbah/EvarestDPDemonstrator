var forHilti = true;
var DATE_FORMAT = 'DD.MM.YY HH:mm:ss';

// TODO: add it to the globals
var op               = null;
// var mqttMinion = null;

var communicationHelper = null;
// defined in init_communication in control_communication.js
var minions = null;
// defined in init_minions in control_minions.js

var sensors = [];
// defined in init_sensors in control_sensors.js

var contacts = [];
var myContactInfo = null;

const DATA_CHANNEL_TBL = ["Last Updated", "Creator", "Lap", "Observations"];
const MSG_TBL_DIS_COL = ["Last Updated", "Type", "Text"];
const MIN_TBL_DIS_COL = ["Sent/Received", "Name", "Type", "Owner"];

/****
 * gets called from the init function in home-view.js
 *
 */
function main(authorizationManager) {
    var email = app.authorizationManager.getProfile().email;
    init_database(email, function(peers) {
        // init_mqtt(function () {
            if (!( email in peers)) {
                myContactInfo = new_contact(email);
                init_minions(null);
                // defined in control_minions.js
                app.changeLoadingStatus();
            } else {
                // peers are successfully retrieved from the DB
                // we can start populating now
                init_peers(peers);
                init_minions(peers[email].minions);

            }
            init_sensors();
            // defined in control_sensors.js
            init_communication();
            // defined in init_communication.js
            onPeerSelected(email);
        // });
    });
    // callback!


}

/***
 * TODO: move this to control_minions.js
 * and add it to the db!
 */
function init_database(email, onDataLoadedCallback) {
    var WORKER_PATH = "../minions/gmins/idb/wm_database.js";

    dbMinion = new Worker(WORKER_PATH, {
        name : "wm_database"
    });

    dbMinion.onmessage = function(event) {
        var message = event.data;
        switch(message.operation) {
        case 'get':
            var key = message.key;
            if (key === 'all') {
                var peers = message.result;
                onDataLoadedCallback(peers);
            }
            break;
        case 'start':
            app.changeLoadingStatus();
            db_get_everything(dbMinion);
            break;
        default:
            console.error("NOT_IMPLEMENTED");
        }

    };
    db_start(dbMinion, email, 3000);
    // TODO move the interval config to the globals!
}

// function init_mqtt(callback) {
//     var WORKER_PATH = '../minions/gmins/mqtt/mqtt_client.js';
//     fetch(WORKER_PATH)
//         .then(function (res) {
//             res.text()
//                 .then(function (javascript) {
//                     eval(javascript);
//                     mqttMinion = new MQTTClient();
//                     callback();
//                 });
//
//         });
// }

/**
 * Creates a contact object for each peer
 * @param {Object} peers: list of peer emails
 */
function init_peers(peers) {
    console.time('init_peers');

    Object.keys(peers).forEach(function(email) {
        let data = peers[email].data;
        let messages = peers[email].messages;
        let minions =  peers[email].minions;
        var datachannels = [];
        
        
        Object.keys(data).forEach(function(dataKey) {
            Object.keys(data[dataKey].laps).forEach(function(lapKey) {
                datachannels.push(new DataChannel(lapKey, data[dataKey].laps[lapKey], dataKey, null, email, 'static'));
            });
        });
        let contact = add_contact(email, datachannels);
        contact.minions = [];
        if (email === app.authorizationManager.getProfile().email) {
            myContactInfo = contact;            
            Object.keys(minions).forEach(function(mname){
                var minionEntry = new Object();
                minionEntry[MIN_TBL_DIS_COL[0]] = moment(new Date(minions[mname].receivedat)).format(DATE_FORMAT);
                minionEntry[MIN_TBL_DIS_COL[1]] = minions[mname].name;
                minionEntry[MIN_TBL_DIS_COL[2]] = minions[mname].type;
                minionEntry[MIN_TBL_DIS_COL[3]] = minions[mname].owner;
                contact.minions.push(minionEntry);
            });
            
        }else{
              Object.keys(minions).forEach(function(mname){
                var minionEntry = new Object();
                minionEntry[MIN_TBL_DIS_COL[0]] = moment(new Date(minions[mname].sentat)).format(DATE_FORMAT);
                minionEntry[MIN_TBL_DIS_COL[1]] = minions[mname].name;
                minionEntry[MIN_TBL_DIS_COL[2]] = minions[mname].type;
                minionEntry[MIN_TBL_DIS_COL[3]] = 'I am';
                contact.minions.push(minionEntry);
            });          
            
        }
        console.assert(Object.keys(minions).length == contact.minions.length, "mismatch", Object.keys(minions).length, contact.minions.length);
        messages.forEach(function(message) {
            var message = contact_append_message(contact, message.direction === 'to', message.timestamp, message.text);

        });        
        ui_set_msg_count_contact(contact);
    
    });// peers
    
    ui_init_contacts(divPeers, contacts, onPeerSelected);
    app.changeLoadingStatus();
    console.timeEnd('init_peers');
    return contacts;
}

function getEmailListMineExcluded() {
    var emails = [];
    var peers = contacts.filter( contact => contact.email !== app.authorizationManager.getProfile().email);
    peers.forEach(function(peer) {
        emails.push(peer.email);
    });
    return emails;
}

function contact_append_message(contact, to, ts, text) {
    // console.time('contact_append_message');
    var msg = new Object();
    msg[MSG_TBL_DIS_COL[0]] = ts;
    msg[MSG_TBL_DIS_COL[1]] = to ? "sent" : "received";
    msg[MSG_TBL_DIS_COL[2]] = text;
    msg.Read = false;
    contact.messages.push(msg);
    // console.timeEnd('contact_append_message');
    return msg;
}

/**
 * This function gets called when a peer is selected
 */
function onPeerSelected(id) {
    var contact = Contact.findContact(contacts, id);
    ui_active_contact(contact, contacts);    
    refresh_message_table(contact);
    refresh_sensor_table(contact);
    refresh_minions_table(contact);
    // #datachannel #subMinion
}

/**
 * populates the drop down list with patients to select from!
 * @param {Object} authorizationManager
 */
function add_contact(email, channels) {
    // we extract the name from the email
    // TODO: add a peer name!
    var name = email.substr(0, email.indexOf('@'));
    if (email === app.authorizationManager.getProfile().email) {
        name = "My Info";
    }
    var contact = new Contact(name, email, channels);
    contacts.push(contact);
    return contact;
}

function new_contact(id) {
    var contact = Contact.findContact(contacts, id);
    if (contact)
        return contact;
    contact = add_contact(id, null);   
    
    ui_add_contact(divPeers, contact, onPeerSelected);
    
    ui_active_contact(contact, contacts);    
    // save it to db
    db_save_peer(dbMinion, id);    
    refresh_message_table(contact);
    return contact;
}

function refresh_sensor_table(contact) {
    // console.time('refresh_sensor_table');
    if (contact.active && isSensorTableActive()) {
        contact.data.sort(function(a, b) {
            return new Date(b[DATA_CHANNEL_TBL[0]]) - new Date(a[DATA_CHANNEL_TBL[0]]);
        });
        ui_create_table(divSensors, contact.email, contact.data, DATA_CHANNEL_TBL, function(p_selectedSensors) {
            // TODO: handle sensor selection
        });
        // create table
    }
    // console.timeEnd('refresh_sensor_table');
}
function refresh_minions_table(contact) {
    
    if (contact.active && isMinionsTableActive()) {
        ui_create_table(divMinionsTable, contact.email, contact.minions, MIN_TBL_DIS_COL, function(selected) {
            
            
        });
     }
    
}

function refresh_message_table(contact) {    
    if (contact.active && isMessageTableActive()) {        
        contact.messages.sort(function(a, b) {
            return new Date(b[MSG_TBL_DIS_COL[0]]) - new Date(a[MSG_TBL_DIS_COL[0]]);
        });
        ui_update_messages(contact.messages, contact.email, divMsgs);
    }
}

function ui_update_messages(messages, from, containerID) {
    var containerElement = document.getElementById(containerID);
    containerElement.innerHTML = '';
    if (messages) {
        var list = document.createElement('div');
        list.setAttribute('class', 'mdl-list demo-list');
        var singleSubject = from;
        var subjectDiv = document.createElement('div'),
            listElement = document.createElement('div'),
            singleContainerSpan = document.createElement('span'),
            avatar = document.createElement('i'),
            avatarText = document.createTextNode('person'),
            nameSpan = document.createElement('span'),
            nameText = document.createTextNode(from),
            line = document.createElement('hr'),
            commentsFolder = document.createElement('div');

        listElement.setAttribute('class', 'mdl-list__item');
        singleContainerSpan.setAttribute('class', 'mdl-list__item-primary-content');
        avatar.setAttribute('class', 'material-icons mdl-list__item-avatar');

        nameSpan.appendChild(nameText);
        avatar.appendChild(avatarText);
        singleContainerSpan.appendChild(avatar);
        singleContainerSpan.appendChild(nameSpan);
        listElement.appendChild(singleContainerSpan);
        subjectDiv.appendChild(listElement);

        messages.forEach(function(msg) {
            var subtitleSpan = document.createElement('p'),
                subtitleText = document.createTextNode(moment(new Date(msg[MSG_TBL_DIS_COL[0]])).format(DATE_FORMAT)),
                textSpan = document.createElement('p'),
                textText = document.createTextNode(msg[MSG_TBL_DIS_COL[2]]),
                commentList = document.createElement('div');
            subtitleSpan.setAttribute('class', 'mdl-list__item-sub-title');
            subtitleSpan.style.fontWeight = 'bold';
            subtitleSpan.style.fontSize = '12px';
            subtitleSpan.style.margin = '2px 0px';
            subtitleSpan.style.lineHeight = '10px';

            textSpan.setAttribute('class', 'mdl-list__item-text-body');
            textSpan.style.fontSize = '11px';
            textSpan.style.margin = '2px 0px';
            console.log(msg[MSG_TBL_DIS_COL[1]]);
            if (msg[MSG_TBL_DIS_COL[1]] === 'sent') {
                commentList.setAttribute('class', 'triangle-left right');
            } else {
                commentList.setAttribute('class', 'triangle-right left');
            }
            commentsFolder.setAttribute('class', 'folder');
            subtitleSpan.appendChild(subtitleText);
            textSpan.appendChild(textText);
            commentList.appendChild(subtitleSpan);
            commentList.appendChild(textSpan);
            commentsFolder.appendChild(commentList);

        });
        subjectDiv.appendChild(commentsFolder);
        list.appendChild(subjectDiv);
        list.appendChild(line);
        containerElement.appendChild(list);
    } else {
        var div = document.createElement('div'),
            errorMessage = document.createElement('p'),
            errorText = document.createTextNode('There is no feedback given to this data');
        div.setAttribute('class', 'centralized warning');
        errorMessage.appendChild(errorText);
        div.appendChild(errorMessage);
        containerElement.appendChild(div);
    }
}// ui_update_messages
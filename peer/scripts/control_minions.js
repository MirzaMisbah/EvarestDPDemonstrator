var minionDropdown = {pmin: "pminMinionDropdown", cmin : "cminMinionDropdown", tmin: 'tminMinionDropdown', macro : 'macroMinionDropdown', gmin : 'gminMinionDropdown'};
var dropdownSearch = {pmin: 'pminMinionSearch', cmin: 'cminMinionSearch', tmin : 'tminMinionSearch', macro : 'macroMinionSearch', gmin : 'gminMinionSearch'};
var dropdownToggle = {pmin: 'togglePMinions',cmin:'toggleCMinions', tmin : 'toggleTMinions', macro : 'toggleMacroMinions', gmin : 'toggleGMinions'};

var minionsDiv = "minions";
var NO_MINIONS_TEST_EMAIL = 'test@test.com';
function init_minions(minions){

    // if(minions && Object.keys(minions).length > 0){
    //     app.minionLoader = new MinionLoader(minionDropdown, minionsDiv,  minions, dbMinion);
    // } else {
    //     app.minionLoader = new MinionLoader(minionDropdown, minionsDiv,  null, dbMinion);
    // }
    if(app.authorizationManager.getProfile().email !== NO_MINIONS_TEST_EMAIL){
       console.warn("No database minions loading default ones");
        var mins = getMinions();
        var reformattedMins = {};
        mins.forEach(function (min) {
            reformattedMins[min.name] = min;
        });
        app.minionManager = new MinionLoader(reformattedMins, minions ? minions : {}, dbMinion, {dropdownIDS : minionDropdown, searchDropdownIDS: dropdownSearch, toggleDropdownIDS : dropdownToggle, parentContainerID : minionsDiv});
    }
}
function fetchAll(minions, callback){
        var fetchPromises = [];
        minions.forEach(function (minion) {
            fetchPromises.push(fetch(minion.uri).then(function (res) {
                return res.text()
                    .then(function (script) {
                        // append script to the subMinion
                        minion.script = script;

                    });
            }));
            if (minion.partner_uri) {
                fetchPromises.push(fetch(minion.partner_uri).then(function (res_partner) {
                    return res_partner.text()
                        .then(function (partner_script) {
                            minion.partner = partner_script;
                        })
                }));
            }
        });
        Promise.all(fetchPromises).then(function () {
            callback();
        });
}

function fetchThinkers(thinkers, callback){
    var fetchPromises = [];
    thinkers.forEach(function (thinker) {
        fetchPromises.push(fetch(thinker.uri).then(function (res) {
            return res.text()
                .then(function (script) {
                    thinker.script = script;
                });
        }));
    });

    Promise.all(fetchPromises)
        .then(function () {
            callback();
        });
}

function fetchThinker (thinker, callback) {
    fetch(thinker.m_worker_reference).then(function (res) {
        return res.text().then(function (script) {
            thinker.m_function = script;
            callback();
        })
    })
}


function send_minion(minion) {
    var contact = Contact.getSelectedContact(contacts);
    var to = contact.email;
    var funname = minion.code;

    communicationHelper.sendBasicMinion([to],
         minion);
    db_save_sent_minion(dbMinion, to, minion.name, minion.type);
}


function update_minion_datachannels(contact, minion){
    var ddlid = minion.container + 'dc';
    var numberOfInputs = app.minionLoader.getNumberOfInputs(minion);

    if (numberOfInputs > 1) {
        for (var i = 0; i < numberOfInputs; i++) {
            ddl_clear(ddlid + i);
            contact.dataChannels.values.forEach(function(dataChannel){
                ddl_add(ddlid+i,dataChannel.creator + '*' + dataChannel.name, dataChannel.creator + '*' + dataChannel.name);
            });
            var selectedChannel = contact.dataChannels.values[contact.dataChannels.values.length -1];
            if(selectedChannel){
                ddl_setSelected(ddlid + i, selectedChannel.creator + '*' + selectedChannel.name);
            }
        }
    } else {
        ddlPopulateContacts(ddlid);
        ddl_setSelected(ddlid + 'User', contact.email);
        ddlPopulateChannels(ddlid);
        var selectedChannel = contact.dataChannels.values[contact.dataChannels.values.length -1];
        if(selectedChannel){
            ddl_setSelected(ddlid + 'Channel', selectedChannel.creator + '*' + selectedChannel.name);
        }
    }
    return selectedChannel;
}

function findDataChannel(dataChannelName, contact){
    if(dataChannelName) {
        if (!!!contact) {
            contact = Contact.getSelectedContact(contacts);
        }
        var channel = contact.dataChannels.values.find(
            channel => (channel.creator + '*' + channel.name) === dataChannelName);
        return channel;
    }
}

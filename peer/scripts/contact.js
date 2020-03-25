/***
 * 
 *		online: true/false
 * 		active: true/false
 * 		nomsgs: int (number of new messeges)
 * 		name: text
 * 		selected_data: timestamp 
 * 
 */

class Contact{
    constructor(name, email, channels){
        var _this = this;
        this.online = false;
        this.active = false;
        this.name = name;
        this.email = email;
        this.minions = null;
        this.htmlId = name.replace('.', '_').replace(' ', '');
        // TODO: need to generate a valid html id in all cases
        this.messages = [];
        this.unread_msgs = 0;

        var data = [];
        this.data = data;

        this.dataChannels = new DataChannel(name, channels);

        if (channels) {// TODO: is really necessary
                channels.forEach(function(channel) {
                Contact._addTableEntry(data, channel);
                channel.addEventListener('add', function(value) {
                    Contact._handleChannelUpdate(_this, channel, value);
                });
            });
            refresh_sensor_table(_this);
            this.unread_msgs = channels.length;
            ui_set_msg_count_contact(_this);

        }

        this.dataChannels.addEventListener('add', function(dc) {
            Contact._addTableEntry(_this.data, dc);
            refresh_sensor_table(_this);
            ui_new_msg_contact(_this);
            app.minionManager.updateInstanceDataChannels();
            db_save_data(dbMinion, _this.email, dc.creator, dc.name, "tbd", dc.values);
            // TODO: this might introduce unnecessary saving at the the begining might be that we

            // existing channel updated!
            dc.addEventListener('add', function(value) {
                Contact._handleChannelUpdate(_this, dc, value);
            });
        });        
        this.selectedChannels = null;

    }
    
    static getSelectedContact(contacts){
        if(contacts)
            return contacts.find(o => o.active == true);
        return null;        
    }    
    static findContact(contacts, email){
        if(contacts)
            return contacts.find( o => o.email === email.toString().trim());
        return null;       
    }
    /**
     * Utility methods!
     */  
    static _handleChannelUpdate(_this, dc, value){
        var dataEntryToUpdate = _this.data.find(entry => entry[DATA_CHANNEL_TBL[1]] === dc.creator && entry[DATA_CHANNEL_TBL[2]] === dc.name);
        dataEntryToUpdate[DATA_CHANNEL_TBL[0]] = moment(dc.lastUpdated).format(DATE_FORMAT);
        dataEntryToUpdate[DATA_CHANNEL_TBL[3]] = dc.length.toString();
        refresh_sensor_table(_this);
        db_save_data(dbMinion, _this.email, dc.creator, dc.name, "tbd", value);
        // mqttMinion.postMessage({mail:  _this.email, creator : dc.creator, name : dc.name, value: value});
    }
    static _addTableEntry(data, dataChannel){
        var dataEntry = new Object();
        dataEntry[DATA_CHANNEL_TBL[0]] = moment(dataChannel.lastUpdated).format(DATE_FORMAT);
        dataEntry[DATA_CHANNEL_TBL[1]] = dataChannel.creator;
        dataEntry[DATA_CHANNEL_TBL[2]] = dataChannel.name;
        dataEntry[DATA_CHANNEL_TBL[3]] = dataChannel.length.toString();    
        data.push(dataEntry);       
    }
}
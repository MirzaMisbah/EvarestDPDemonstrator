/**
 * Dependencies: JQUERY, MDL CSS
 * 
 * Example:
 * 	ddl_init('ddl', function(val){console.log(val);});
 * 	ddl_add('ddl', 'patient1', 'p@x');
 *  ddl_add('ddl', 'patient2', 'p@y');
 * 	ddl_remove('ddl', 'p@y');
 */

var TEST ="hi";
/**
 * Adds an option to the select-tag
 * @param {Object} ddl_ID: the select html-tag id
 * @param {Object} txt: the option text
 * @param {Object} val: the option value
 */
function ddl_add(ddl_ID, txt, val) {
	var patients = $('#' + ddl_ID);
	
	var option = $("<option>", {value:val});
	//<span class="mdl-badge" data-badge="on">Mood</span>
	var status = $("<span>",{"class": "mdl-badge",  "data-badge": "ON"} );
	status.append(txt);
	option.append(status); // add the status to the option
	patients.append(option);// add the option to the select element
}
/**
 * Removes an option from the select-tag
 * @param {Object} ddl_ID he select html-tag id
 * @param {Object} val the value of the option to remove
 */
function ddl_remove(ddl_ID, val) {
	$("#" + ddl_ID + " option[value='" + val + "']").remove();
}
function ddl_clear(ddl_ID){
    $("#" + ddl_ID).find("option").remove();
}
/**
 * Add necessary things for the select-tag
 * @ddl_ID
 * @callback
 */
function ddl_init(ddl_ID, callback) {
	const ddl = $("#" + ddl_ID);	
	
	//ddl.addClass("mdl-textfield mdl-js-textfield  getmdl-select getmdl-select__fix-height ");	//
	ddl.change(function() {
		callback(ddl_getSelected(ddl_ID));
	});
	
	
}
function ddl_create(ddl_ID, callback){        
   // var ddl = $("<select>");
   
    var ddl =  document.createElement('select');
    ddl.setAttribute("id", ddl_ID);
    
    ddl.addEventListener('change',    
    function() {
        callback(ddl_getSelected(ddl_ID));
    });
    return ddl;
}

function ddlCreate2 (ddl_ID, callback, number = 1) {
    if (!document.getElementById(ddl_ID))
	    var container = document.createElement('div');
    else
        var container = document.getElementById(ddl_ID);
    var ddlUser =  document.createElement('select');

    container.setAttribute('id', ddl_ID);
    ddlUser.setAttribute('id', ddl_ID + 'User');

    ddlUser.addEventListener('change', function () {
    	ddlPopulateChannels(ddl_ID, number);
    	var channels = [];
    	for (var i = 0; i < number; i++) {
    		channels.push(ddl_getSelected(ddl_ID + 'Channel' + i));
		}
		callback(ddl_getSelected(ddl_ID + 'User'), channels);
    });
    container.appendChild(ddlUser);
    for (var i = 0; i < number; i++) {
        var ddlChannel =  document.createElement('select');
        ddlChannel.setAttribute('id', ddl_ID + 'Channel' + i);

        ddlChannel.addEventListener('change', function () {
            var channels = [];
            for (var i = 0; i < number; i++) {
                channels.push(ddl_getSelected(ddl_ID + 'Channel' + i));
            }
            callback(ddl_getSelected(ddl_ID + 'User'), channels);
        });
        container.appendChild(ddlChannel);
	}

    return container;


}

function ddlPopulateContacts (ddl_id, number = 1) {
	var userSelect = document.getElementById(ddl_id + 'User');
	ddl_clear(userSelect.id);
	contacts.forEach(function (contact) {
		ddl_add(userSelect.id, contact.email, contact.email);
    });
	ddl_setSelected(userSelect.id, contacts[0].email);
    ddlPopulateChannels(ddl_id, number);
}

function ddlPopulateChannels (ddl_id, number=1) {
    var contactID = ddl_getSelected(ddl_id + 'User');
    if (!contactID)
        contactID = Contact.getSelectedContact(contacts).email;
	var contact = Contact.findContact(contacts, contactID);

	for (var i = 0; i < number; i++) {
        var channelSelector = document.getElementById(ddl_id + 'Channel' + i);
        ddl_clear(channelSelector.id);
        if (contact.dataChannels.values && contact.dataChannels.values.length > 0) {
            contact.dataChannels.values.forEach(function (channel) {
                ddl_add(channelSelector.id,channel.creator + '*' + channel.name, channel.creator + '*' + channel.name);
            });
            ddl_setSelected(channelSelector.id, contact.dataChannels.values[contact.dataChannels.values.length-1].creator + '*' + contact.dataChannels.values[contact.dataChannels.values.length-1].name);
        }
	}

}

function ddl_create_multiple(ddl_ID, number, callback){
    // var ddl = $("<select>");
	var selectElements = [];
	for (var i = 0; i < number; i++) {
        var ddl =  document.createElement('select');
        ddl.setAttribute('style', 'width: 100px;');
        ddl.setAttribute("id", ddl_ID + i);
        ddl.addEventListener('change', function() {
        	var channels = [];
			for (var j = 0; j < number; j++) {
				channels.push(ddl_getSelected(ddl_ID+j));
			}
			callback(channels);
		});
        selectElements.push(ddl);
	}
    return selectElements;
}

function ddl_create_multiple2(ddl_ID, callback, number){
    // var ddl = $("<select>");
    var selectElements = [];
    for (var i = 0; i < number; i++) {
        var ddl =  document.createElement('select');
        ddl.setAttribute('style', 'width: 100px;');
        ddl.setAttribute("id", ddl_ID + i);
        ddl.addEventListener('change', function() {
            var channels = [];
            for (var j = 0; j < number; j++) {
                channels.push(ddl_getSelected(ddl_ID+j));
            }
            callback(channels);
        });
        selectElements.push(ddl);
    }
    return selectElements;
}
/**
 * returns the value of the selected option
 * @param {Object} ddl_ID
 */
function ddl_getSelected(ddl_ID) {
	const ddl = $("#" + ddl_ID);
	return ddl.val();
}

function ddl_setSelected(ddl_ID, value) {
    var ddl = $('#' + ddl_ID);
    ddl.val(value);
}



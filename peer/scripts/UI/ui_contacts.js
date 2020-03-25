/**
 * contact ={
 *		online: true/false
 * 		active: true/false
 * 		nomsgs: int (number of new messeges)
 * 		name: text
 * 		selected_data: timestamp
 * }
 *
 * @param {Object} divId
 * @param {Object} contact */

function ui_add_contact(divId, contact, select_cb) {
	var div = $('#' + divId);

	var span_contact = $("<div>", {
		class : "mdl-chip-custom",
		value : contact,
		id : contact.htmlId
	});

	span_contact.click(function() {
		select_cb(contact.email);
	});


	var img = $("<img>",{		
		class: "patient patient-off"		
	});		
	
	var badge = $("<span>",{
		class: "mdl-badge",
		"data-badge": contact.unread_msgs
	});
	badge.append(img);
	
	var span_status = $("<span>");	
	span_status.append(badge);	
	
	
	var span_text = $("<span>", {
		class : "mdl-chip__text"
	});
	span_text.append(contact.name);

	span_contact.append(span_status);
	span_contact.append(span_text);

	div.append(span_contact);
}

function ui_active_contact(contact, contacts) {
	if (!contact)
		return;	
		
	var span_contact = $('#' + contact.htmlId);
	
	
	span_contact.addClass('selected');
	contact.active = true;	

	contacts.forEach(function(_contact) {// TODO: optimize		
		if (contact != _contact) {
			_contact.active = false;			
			let span_contact = $('#' + _contact.htmlId);
			span_contact.removeClass('selected');			
			
		}
	});

}

function ui_online_contact(contact) {
	contact.online = true;
	var span_status = $('#' + contact.htmlId).find('.patient-off');
	span_status.removeClass('patient-off');
	span_status.addClass('patient-on');
}

function ui_offline_contact(contact) {
	contact.online = false;
	var span_status = $('#' + contact.htmlId).find('.patient-on');
	span_status.removeClass('patient-on');
	span_status.addClass('patient-off');
}

function ui_new_msg_contact(contact) {
	contact.unread_msgs = contact.unread_msgs + 1;
	ui_set_msg_count_contact(contact);
}
function ui_read_msg_contact(contact) {
	contact.unread_msgs = contact.unread_msgs - 1;
	ui_set_msg_count_contact(contact);
}
function ui_set_msg_count_contact(contact) {
	contact.unread_msgs = contact.unread_msgs;
	var badge = $('#' + contact.htmlId).find('.mdl-badge');	
	badge.attr("data-badge", contact.unread_msgs);
}

function ui_clear_msg_contact(divId, contact) {
	contact.unread_msgs = 0;
	ui_new_msg_contact(contact.unread_msgs);
}

function ui_remove_contact(divId, contact) {
	var div = $('#' + divId);

}

function ui_init_contacts(divId, contacts, select_cb) {
	var div = $('#' + divId);

	contacts.forEach(function(contact) {		
		ui_add_contact(divId, contact, select_cb);
	});
	ui_active_contact(contacts[0], contacts); // TODO: hack!
	
}

function ui_get_selected_contact(divId) {
	var div = $('#' + divId);

}


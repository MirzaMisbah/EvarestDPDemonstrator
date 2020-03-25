var divCommContent = "divCommContent";
var divComm = "divComm";

var divSensorsMother = "divSensors"; // TODO: rename to datachannel!
var divSensorsConent = "divSensorsConent";
var divSensors = "tblSensors";


var divMinionsTableMother = "divMinionsTable";
var divMinionsTableContent = "divMinionsTableContent";
var divMinionsTable = "tblMinions";

var btnStartRound = "btnStartRound";
var btnStopRound = "btnStopRound";

var btnSend = "btnSendComment";
var txtSend = "txtSend";

var divAlgo = "divMinionWorkspace";
var divPeers = "divPeers";
var divMsgs = "tblMessages";


var divAddPeer = "divAddPeer";
var divPeer = "divPeer";
var btnAdd = "btnAddPeer";

var divLapControlMother     = "divLapControlMother";
var divLapControlContent    = "divLapControl";


var txtMail = "txtPeerEmail";
var txtInterval = "txtInterval";
var txtRound = "txtRound";

var cbxSensors = "cbSensor";

/*********************************************************************************************************************
 *                                      EVENT Handling
 *
 *********************************************************************************************************************/

window.onload = function() {
    /***
     * handle send message
     */
    $('#' + btnSend).click(function() {// TODO: retest
        // who is the active contact, this is the one we want to send the message to
        var contact = Contact.getSelectedContact(contacts), //TODO: check it is not you
            txt = $('#' + txtSend).val();
        if (contact) {
            communicationHelper.sendMessage([contact.email], txt);
            db_save_message(dbMinion, contact.email, true, txt);
            contact_append_message(contact, true, new Date().getTime(), txt);
            refresh_message_table(contact);
        } else {
            app.showNotification('Please select your contact first!', 1000);
        }
    });
    /**
     * handle add peer
     */
    $('#' + btnAdd).click(function() {
        var email = $('#' + txtMail).val().trim().toLowerCase();
        new_contact(email);
    });
    /****
     * handle listen to sensors checkbox checked
     */
    $('#' + cbxSensors).click(function() {
        if (this.checked) {            
            activate_sensors(getLapValue());
        } else {
            deactivate_sensors();
        }
    });
    /****
     * handle start round click
     */
    $('#' + btnStartRound).click(function() {
        // read the sending interval from the UI
        var interval = parseInt($('#' + txtInterval).val().trim());
        communicationHelper.sendStartLap(getEmailListMineExcluded(), getLapValue(), interval);

    });
    /****
     * handle stop round click
     */
    $('#' + btnStopRound).click(function() {
        communicationHelper.sendStopLap(getEmailListMineExcluded());
        $('#' + txtRound).val('');
    });

    addToMenu('Data Channels', 'info', function() {
        showThisHideTheRest(divSensorsMother);
        refresh_sensor_table(Contact.getSelectedContact(contacts));
    });
    addToMenu('Messages', 'mail', function() {
        showThisHideTheRest(divComm);
        refresh_message_table(Contact.getSelectedContact(contacts));
    });
    addToMenu('Lap Control', 'timer', function() {
        showThisHideTheRest(divLapControlMother);
    });
    addToMenu('Peer Control', 'face', function() {
        showThisHideTheRest(divAddPeer);
    });
    addToMenu('Minions Log', 'assignment', function() {
        showThisHideTheRest(divMinionsTableMother);
        refresh_minions_table(Contact.getSelectedContact(contacts));
    });    

};
function getLapValue(){
     var lap = $('#' + txtRound).val().trim();
     if (!!!lap) {
            lap = '' + moment(new Date()).format(DATE_FORMAT);
            $('#' + txtRound).val(lap);
     }
     return lap;
}
$(document).ready(function() {
    // run browser compatibility check

    function reqlib_checkCompatibility(supportedBrowsers){
        var browserCheck = new BrowserCheck(supportedBrowsers);
        return browserCheck.checkCompatibility();
    }

    var isCompatible = reqlib_checkCompatibility(app.SUPPORTED_BROWSERS);
    if (!isCompatible) {
        var browsers = '';
        app.SUPPORTED_BROWSERS.forEach(function (brw) {
            browsers = browsers + brw.name + '(min version:' + brw.minVersion + '),';
        });
        browsers = browsers.slice(0, -1);
        alert("Sorry we only support the following browsers: " + browsers);
    }
    /***
     * dynamically append the HTML elements from head.html & common.html
     */
    include(document.querySelector('link[href="head.html"]').import.head.childNodes);
    include(document.querySelector('link[href="common.html"]').import.body.childNodes);
    function include(nodes) {
        var nodesToInclude = nodes;
        for (var i = 0; i < nodesToInclude.length; i++) {
            var node = nodesToInclude[i].cloneNode(true);
            document.getElementById("motherDiv").appendChild(node);
        }
    }

    initSection(divSensorsMother, "Data Channels", divSensorsConent);
    initSection(divComm, "Messages", divCommContent);
    initSection(divAddPeer, "Peer Control", divPeer);
    initSection(divLapControlMother, "Lap Control", divLapControlContent);
    initSection(divMinionsTableMother, "Minions Log", divMinionsTableContent);

    $('.slider').bxSlider({
        auto : false,
        autoControls : false,
        stopAutoOnClick : false,
        pager : false,
        startSlide: 1
       /* slideWidth : 100*/
    });
});

function addToMenu(text, iconname, callback) {
    var menuItem = $('<a>');
    menuItem.addClass("mdl-navigation__link");
    var menuIcon = $('<i>');
    menuIcon.addClass("mdl-color-text--blue-grey-400 material-icons");
    menuIcon.attr("role", "presentation");
    menuIcon.append(iconname);
    // TODO: have another icon~
    menuItem.click(function() {
        callback();
    });
    menuItem.append(menuIcon);
    menuItem.append(text);
    $('#menu').append(menuItem);
}

function initSection(divMotherId, title, divContentId) {
    var divMother = $("#" + divMotherId);
    var divContent = $("#" + divContentId);

    divMother.addClass("demo-card-square mdl-card mdl-shadow--2dp");
    divContent.addClass("mdl-card__supporting-text");

    var divHeader = $("<div>");
    divHeader.addClass("mdl-card__title mdl-card--expand mdl-color--primary-dark");
    divHeader.css('background-image', 'url()');
    divHeader.css('height', '50px');
    divHeader.css('text-align', 'center');
    divHeader.html("<h4>" + title + "</h4>");

    divContent.before(divHeader);
    divMother.hide();
}

function showThisHideTheRest(divId) {
    $('#divMain').children().hide();
    $('#' + divId).show();
}

function isMessageTableActive() {
    return isVisible(divComm);
}
function isMinionsTableActive() {
    return isVisible(divMinionsTable);
}

function isSensorTableActive() {
    return isVisible(divSensors);
}

function isVisible(elementId) {
    return $('#' + elementId).is(":visible");
}

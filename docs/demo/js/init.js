// TODO
const uiAdapter = new tucana.adapter.DOMUIAdapter(document.getElementById("main-place"));

const database = new tucana.adapter.IndexedDBDatabaseHandler();
const identificationHandler = new tucana.adapter.BrowserFingerprintIdentificationHandler('id01', 'logoutButton');
const baasCommunicationHandler = new tucana.adapter.RESTAPIBaaSCommunicationHandler();
const uPeerCommunicationHandler = new tucana.adapter.WebRTCUPeerCommunicationHandler({
    myId: identificationHandler.getLocalID(),
    myLocalId: identificationHandler.getLocalID(),
    rtcConfig: {
        "iceServers": [{
            "url": "stun:stun2.1.google.com:19302"
        }]
    }
});

const tucanaPlatform = new tucana.TucanaCoreService(database, uPeerCommunicationHandler, baasCommunicationHandler, identificationHandler, uiAdapter);

fetch('smart_service.json')
    .then((response) => {
        return response.json();
    }).then(json => {
        var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
        return Promise.all([tucanaPlatform.createSmartServiceConfiguration(sscItem), new Promise((resolve, reject) => resolve(json))]);
    }).then(result => {
        if (result[0].success) {
            return tucanaPlatform.loadSmartServiceConfiguration(result[1].id)
        }
    }).then(result => {
        if (result.success && result.state instanceof tucana.minionstate.MinionsBound) {
            tucanaPlatform.runSmartService();
            setTimeout(() => {
                console.log('Terminated');
                tucanaPlatform.terminateSmartService();
            }, 20000);
        }
    });

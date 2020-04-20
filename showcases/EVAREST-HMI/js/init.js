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

console.log(identificationHandler.getLocalID());
const tucanaPlatform = new tucana.TucanaCoreService(database, uPeerCommunicationHandler, baasCommunicationHandler, identificationHandler, uiAdapter);




function startCallback(id) {
    tucanaPlatform.startService(id);
}
console.log('I am Init')
fetch('./showcases/EVAREST-HMI/EVAREST_HMI.json')
    .then((response) => {
        return response.json();
    }).then(json => {
        var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
        tucanaPlatform.createSmartServiceConfiguration(sscItem)
    }).then(() => {
        tucanaPlatform.getSmartServiceConfigurationItemIds().then((ids) => {
            
            console.log(ids);
            console.log(ids.smartServiceConfigurationItemIds[0]);
            delete (ids.smartServiceConfigurationItemIds[1]);
            console.log(ids)
            uiAdapter.showServiceSelection(ids, startCallback);
        }, () => {
            console.log("service id fetch error");
        });
    });

    if(localStorage.getItem("provider")  == "true"){
        fetch('./showcases/EVAREST-HMI/TestService.json')
        .then((response) => {
            return response.json();
        }).then(json => {
            var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
            tucanaPlatform.createSmartServiceConfiguration(sscItem)
        });
    }

    else{
        setTimeout(function () {            
            fetch('./showcases/EVAREST-HMI/TestService.json')
            .then((response) => {
                return response.json();
            }).then(json => {
                var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
                tucanaPlatform.createSmartServiceConfiguration(sscItem)
            });
         }, 40000) 
    }


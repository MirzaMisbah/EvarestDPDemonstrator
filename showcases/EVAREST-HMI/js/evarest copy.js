var nlp = new Bravey.Nlp.Fuzzy();
var intents = undefined;
var sc = false;
var index = elasticlunr(function () {
    this.addField('keyWords');
    this.addField('description');
    this.addField('id');
});
dp_quried = undefined;

createIntents()
addDataProducts()

function addDataProducts() {
    $.getJSON("../products/products.json", function (json) {
        for (i = 0; i < json.length; i++) {
            index.addDoc(json[i]);
        }
    });
}

function predictDataproduct(customer_msg) {
    result = index.search(customer_msg);
    return result;
}

function createIntents() {
    $.getJSON("../conversation.json", function (json) {
        for (i = 0; i < json.length; i++) {
            for (j = 0; j < (json[i].question).length; j++) {
                addIntent(json[i].question[j], json[i].intent);
            }
        }
        intents = json;
    });
}

function addIntent(msg, intent) {
    nlp.addDocument(msg, intent, { fromFullSentence: true, expandIntent: true });
}

function getIntent(msg) {
    intent = nlp.test(msg).intent;
    return intent;
}

function get_timestamp() {
    var dt = new Date();
    timestamp = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    return timestamp
}

function addYou() {
    // Adds 'You' to customer msg
    var p = document.getElementById('chat-box');
    var newElement = document.createElement('p');
    newElement.setAttribute('class', "small text-muted media w-50 ml-auto mb-3");
    newElement.setAttribute('style', "padding: 0; margin: 0;");
    var html = '<span> You </span>'
   // newElement.innerHTML = html;
    //p.appendChild(newElement);
}

function questionMessage() {
    // Adds an element to the document
    customer_msg = document.getElementById('msg').value
    if (customer_msg != '') {
        addYou()
        timestamp = get_timestamp()
        var p = document.getElementById('chat-box');
        var newElement = document.createElement('div');
        newElement.setAttribute('class', "media w-50 ml-auto mb-3");
        document.getElementById('msg').value = ''
        console.log(customer_msg)
        // NLP logic here
        intent = getIntent(customer_msg);
        generateAnswer(intent, customer_msg);
        
        
    }
    else{
        alert("Please use search bar below to tell us, how can we help you?");
    }
}
function questionMessagewithAlert() {
    // Adds an element to the document
    customer_msg = document.getElementById('msg').value
    if (customer_msg != '') {
        addYou()
        timestamp = get_timestamp()
        var p = document.getElementById('chat-box');
        var newElement = document.createElement('div');
        newElement.setAttribute('class', "media w-50 ml-auto mb-3");
        document.getElementById('msg').value = ''
        console.log(customer_msg)
        // NLP logic here
        intent = getIntent(customer_msg);
        generateAnswer(intent, customer_msg);
        
        
    }
    else{
        alert("Please use search bar below to tell us, how can we help you?");
    }
}

function extractDetails(dp, intent) {
    detail = undefined;
    if(intent == 'pricing'){
        detail = "This data set costs " + dp.doc.offers.price + " " + dp.doc.offers.priceCurrency;
    }
    if(intent == 'validity'){
        detail = "The price for this data set is valid untill " + dp.doc.offers.priceValidUntil;
    }
    if(intent == 'vendor'){
        detail = ("This data set is offered by: " + dp.doc.offers.seller.location);
    }
    if(intent == 'format'){
        detail = 'No Details available regarding format of ' + dp.doc.name;
    }
 
    return detail;
}

function generateAnswer(intent, customer_msg) {
    console.log(intent);
    if (intents == undefined) {
        createIntents();
    }
    check = false;
    for (i = 0; i < intents.length; i++) {
        if (intent == intents[i].intent) {
            if (intents[i].auto_generated == 0) {
                reply = intents[i].answer[Math.floor(Math.random() * intents[i].answer.length)];
                if (intents[i].show_button == 1) {
                    text = intents[i].button_text;
                    vis = intents[i].visualization;
                    printAnswerAndButton(reply, text, "SC", vis);
                    console.log(printAnswerAndButton)

                }
                else if (intents[i].show_button == 2) {
                    producer = Math.floor(Math.random() * 2)
                    console.log(producer)
                    text = intents[i].button_text;
                    vis = "";
                    if (producer == 0){vis = "ProducerA.html"}
                    if (producer == 1){vis = "ProducerB.html"}
                    console.log(vis)
                    printAnswerAndButton(reply, text, "upload", vis);
                    console.log(printAnswerAndButton)

                }
                else{
                    printAnswer(reply)
                }
            }
            else {
                if (intents[i].auto_generated == 1) {
                    dp = predictDataproduct(customer_msg)
                    console.log(dp)
                    
                    if (Array.isArray(dp) && dp.length) {
                        dp_quried = dp[0].doc.id;
                        return "Yes, we have a data product that fits your description. " + dp[0].doc.description;
                    }
                }
                else if (dp_quried != undefined && intents[i].auto_generated == 1.1) {
                    reply = extractDetails(dp[0], intent)
                    return reply;
                    }
                else if (dp_quried == undefined && intents[i].auto_generated == 1.1) {
                    return "You must decide on Data Product first before asking for details";
                }
                    
                }
                check = true;
            }
        }
        if (check == true){
            alert("We evaluated your query and we can help you .. ");  
            openlink('main0.html')
        }
        else{
            alert("Please repharase your query so that we can help you better!"); 
        } 
        return "Oops. I didn't understand. Please rephrase your query.";
}


function printAnswer(value) {
    // Adds an element to the document
    timestamp = get_timestamp()
    var p = document.getElementById('chat-box');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', "media w-50 mb-3 ");
    var html = '<div class="media-body ml-3"> ' +
        '<div class="bg-light rounded py-2 px-3 mb-2">' +
        '<p class="text-small mb-0 text-muted" style="font-size:18px; color=black;">' + value + '</p>' +
        '</div> ' +
        '<p class="small text-muted"><span>' + timestamp + '</span> </p>' +
        '</div>'
    newElement.innerHTML = html;
    //p.appendChild(newElement);
    //p.scrollTop = p.scrollHeight;
}

function show_vis(link) {
  window.open("https://localhost:5000/showcases/DataProducts/" + link );
}


function printAnswerAndButton(value, button_text, button_id, link) {
    // Adds an element to the document
    timestamp = get_timestamp()
    var p = document.getElementById('chat-box');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', "media w-50 mb-3 ");
    var button = document.getElementById(button_id);
    if(button){
        button_id = button_id + Math.random();
    }
}
function openlink(link) {
    window.close();
    if (localStorage.getItem("producer") == "true") {role = "producer"}
    else if (localStorage.getItem("provider") == "true") {role = "provider"}
    else if (localStorage.getItem("guest") == "true") {role = "guest"}

    window.open("../html/" + link + "?role=" + role + "?name=" + localStorage.getItem("name"));
    
}

function setScReqValue() {
    sc = true;  
}

function checkScReqValue() {
    if (sc == true){
        return true;
    }
    else{
        return false;
    }
    
}
function showalert(txt) {
    alert(txt);
}

function connectedPeers(){
    jQuery.getScript("../PeerCommunicator.js",function(){
        alert('inside connected peer')
        TPC = new TestPeerCommunicator();
        TPC.getConnectedPeers().then();
        });
}

function requestContract() {
    var d = new Date();
    //check = setScReqValue();
    var answer = window.confirm('Your are about to request Sindo for SAS. Do you really want to do this?');
    if (answer){
        showalert('Your request has been send to sindo!');
        DeleteDB();
        removeConnectedPeer();
            //StartService()
            doAsyncA().then(function (response) {
                if (checkConnectedPeer()){  
                    location.reload();  
                }
                else{}          
            
              }).then(function(){        
                    setTimeout(function () {
                        if (checkConnectedPeer()){
                            removeConnectedPeer(); 
                        }
                        else{
                            showalert('There is some network issue. We are trying to forward your request. Please have patience!');
                        }                 
                    }, 20000) 
                if (checkConnectedPeer()){  
                    removeConnectedPeer();  
                }
                else{}
              })
            }
      checkResponse();
        }

function checkConnectedPeer(){
    if(window.localStorage.getItem('Connected peer')){
        return true;
    }
    else{
        return false;
    }
}

function removeConnectedPeer(){
    window.localStorage.removeItem("Connected peer");
}
function DeleteDB(){
    var req = indexedDB.deleteDatabase('sscItem'|'data'|'swComponent');
       req.onsuccess = function () {
       console.log("Deleted database successfully");
        };
}

function checkResponse(){
    var i = 0;
    setTimeout(function () {
        console.log('connected peer removed in timeout');
        removeConnectedPeer();
    }, 30000);

    (function myLoop (i) {          
        setTimeout(function () {   
            console.log("checking response");
            console.log(checkConnectedPeer())
            if (checkConnectedPeer()){
                console.log(checkConnectedPeer())
                showalert('Congratulations !! Sindo accepted your request. We are setting a smartcontract for you');
                openlink('main02.html')
                i=0;
            }
            else{
                showalert("Please wait !! Sindo didn't accepted your request yet.");
                if ((100)) myLoop(--i); //  decrement i and call myLoop again if i > 0
            }                 
        }, 40000)
     })(100); 
  }


  function respondContract(){
    removeConnectedPeer();
    var i = 0;
    chk = true;
    (function myLoop (i) {          
        setTimeout(function () {   
            console.log("checking response");
            var checkRespond =  checkConnectedPeer();
                console.log(checkRespond);
            if (checkRespond){
                var answer = window.confirm('Mero requested for your service. Do you want to share it!');
                if (answer)
                {   
                    doAsyncB().then(function(){        
                        (function myLoop (i) {          
                            setTimeout(function () { 
                                //StartService()
                                removeConnectedPeer();
                                console.log(checkRespond)
                                openlink('main12.html')
                                i=0;
                            }, 20000)
                         })(100);
                      })
                    showalert('We are setting a smart contract for you.');                                     
                }     
            }                
           if ((100)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
        }, 10000)
     })(100);  

    if (i==0){
    _return = false;
    }
    else if (i > 0){
    _return = true;
    }
      console.log("contract responded");
      return _return;
    }


    function StartServiceA(){
        const uiAdapter = new tucana.adapter.DOMUIAdapter(document.getElementById("main-place"));
    
        const database = new tucana.adapter.IndexedDBDatabaseHandler();
        const identificationHandler = new tucana.adapter.Browser();
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
          
        fetch('../EVAREST_HMIA.json')
        .then((response) => {
            return response.json();
        }).then(json => {
            var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
            tucanaPlatform.createSmartServiceConfiguration(sscItem)
        }).then(() => {
            tucanaPlatform.getSmartServiceConfigurationItemIds().then((ids) => {
                console.log(ids)
                tucanaPlatform.startService('EVARESTHMIA');
            }, () => {
                console.log("service id fetch error");
            });
        });
    }
    function StartServiceB(){
        const uiAdapter = new tucana.adapter.DOMUIAdapter(document.getElementById("main-place"));
    
        const database = new tucana.adapter.IndexedDBDatabaseHandler();
        const identificationHandler = new tucana.adapter.Browser();
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
          
        fetch('../EVAREST_HMIB.json')
        .then((response) => {
            return response.json();
        }).then(json => {
            var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
            tucanaPlatform.createSmartServiceConfiguration(sscItem)
        }).then(() => {
            tucanaPlatform.getSmartServiceConfigurationItemIds().then((ids) => {
                console.log(ids)
                tucanaPlatform.startService('EVARESTHMIB');
            }, () => {
                console.log("service id fetch error");
            });
        });
    }
    
    function sendDataProduct(){
            var answer = window.confirm('Your are about to Transfer your data. Do you really want to do this?');
            if (answer){
                showalert('We are trying to reach Mero. SAS will be send shortly!');
                //StartService()
                    doAsyncB().then(function(){        
                        (function myLoop (i) {          
                            setTimeout(function () {   
                                console.log("checking response");
                                var checkRespond =  checkConnectedPeer();
                                console.log(checkRespond);
                                if (checkConnectedPeer()){
                                    showalert('SAS has been send to sindo!');
                                    removeConnectedPeer();
                                    openlink('main1L.html')
                                    i=0; 
                                }
                                else{
                                    showalert('There is some network issue. We are trying to establish connection. Please have patience!');
                                    if ((100)) myLoop(--i);      //  decrement i and call myLoop again if i > 0                                
                                }               
                            }, 20000)
                         })(100);
                      })
                    }
    }
    

    function receivedDataProduct(){
        (function myLoop (i) {          
            setTimeout(function () {   
                console.log("checking response");
                var checkRespond =  checkConnectedPeer();
                console.log(checkRespond);
                if (checkConnectedPeer()){
                    showalert("Yes you can upload data. SAS has been issued by 'Sindo'!");
                    removeConnectedPeer();
                    openlink('mainL.html')
                    i=0; 
                }
                else{
                    showalert("You didnt received any SAS by 'Sindo' yet!");
                    if ((100)) myLoop(--i);      //  decrement i and call myLoop again if i > 0                                
                }               
            }, 20000)
         })(100);
    }
    async function doAsyncA () {
        // we are now using promise all to await all promises to settle
        var responses = await Promise.all([StartServiceA()]);
        return responses;
    }
    async function doAsyncB () {
        // we are now using promise all to await all promises to settle
        var responses = await Promise.all([StartServiceB()]);
        return responses;
    }
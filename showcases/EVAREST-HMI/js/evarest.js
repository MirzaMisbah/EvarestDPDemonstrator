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

    /*var html = '<div class="media-body ml-3"> ' +
        '<div class="bg-light rounded py-2 px-3 mb-2">' +
        '<p class="text-small mb-0 text-muted" style="font-size:18px; color=black;">' + value + '</p>' +
        '</div> ' +
        '<p class="small text-muted"><span>' + timestamp + '</span> </p>' +
        '<button id="' + button_id + '" style="margin: 10px;" type="button" class="btn btn-info" >' + button_text + '</button>' +
        '</div>'
        */
   // newElement.innerHTML = html;
   // p.appendChild(newElement);
   // document.getElementById(button_id).onclick = function() {show_vis(link)};
   // p.scrollTop = p.scrollHeight;
}
function openlink(link) {
    window.close();
    window.open("../html/" + link);
    
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

async function requestContract() {
    var d = new Date();
    //check = setScReqValue();
    var answer = window.confirm('Your are about to request Sindo for SAS. Do you really want to do this?');
    if (answer){
        showalert('Your request has been send to sindo!');
        DeleteDB();
        removeConnectedPeer();
            StartService();
            if (checkConnectedPeer()){  
                location.reload();  
            }
            else{}          
          }
          for (var i = 0; i = 0; i++){
            if (checkConnectedPeer()){  
                removeConnectedPeer();  
            }
            else{i = 1;}
          }
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
    var req = indexedDB.deleteDatabase('sscItem');
       req.onsuccess = function () {
       console.log("Deleted database successfully");
        };
}
async function StartService(){
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
      
    fetch('../EVAREST_HMI.json')
    .then((response) => {
        return response.json();
    }).then(json => {
        var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
        tucanaPlatform.createSmartServiceConfiguration(sscItem)
    }).then(() => {
        tucanaPlatform.getSmartServiceConfigurationItemIds().then((ids) => {
            console.log(ids)
            tucanaPlatform.startService('EVARESTHMI');
        }, () => {
            console.log("service id fetch error");
        });
    }).then(() => {
        removeConnectedPeer();    
    });
}

function checkResponse(){
    var i = 0;
    setTimeout(function () {
      for (i = 0;i < 10; i++) {
      var checkRequest =  checkConnectedPeer()
      if (checkRequest == true){
          showalert('Congratulations !! Sindo accepted your request. We are setting a smartcontract for you');
          openlink('main02.html')
          i = 10;
      }          
    }
    }, 50000);
    if (i==10){
      showalert('Unfortunately, your request has not been accepted by Sindo!');
    }
  }

  function respondContract(){
    removeConnectedPeer();
    var i = 0;
    setTimeout(function () {
        label:
        while (i < 100) {
        var checkRespond =  checkConnectedPeer();
        if (checkRespond){
            var answer = window.confirm('Mero requested for your service. Do you want to share it!');
            if (answer)
            {   
                showalert('We are setting a smart contract for you.');
                console.log(checkConnectedPeer()) 
            }
            break label;      
        } 
        else{
            i++;
        }         
      }}, 10000);

      if (i==100){
        showalert('Unfortunately, No one contacted you for your service recently');
        _return = false;
      }
      else if (i<100){
        _return = true;
      }
      return _return;
    }
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
            doAsync().then(function (response) {
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

    function uploadData() {
        var d = new Date();
        //check = setScReqValue();
        var answer = window.confirm('Your are about to upload your data. Do you really want to upload it?');
        if (answer){
            showalert('Your data has been uploaded. We are aggregating your data according to provided SAS by sindo');
                //StartService()
                doAsyncB().then(function(){
                    
                    setTimeout(function () {
                        if (checkConnectedPeer() || !checkConnectedPeer()){  
                        removeConnectedPeer();
                        showalert('We are redirecting you to visualization'); 
                        openlink('mainL.html')
                        }
                        else{
                            showalert('There is some network issue please try again after some time!');
                        }
                    }, 40000)
                    });
                }
                else{}
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

function checkResponse(){
    removeConnectedPeer();
    var i = 0;
    chk = true;
    (function myLoop (i) {          
        setTimeout(function () {   
            console.log("checking response");
            var checkRespond =  checkConnectedPeer();
            console.log(checkRespond);
            if (true){
                showalert('Sindo accepted your request. We are setting a smart contract for you.');
                //setTimeout(function () { 
                openlink('main02.html');
                //}, 10000)                                                         
                }
                else{
                    showalert("Sindo didn't accepted your request yet. Please have patience!");
                }                   
           if ((20000)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
        }, 30000)
     })(10000);  
    if (i==0){
    _return = false;
    }
    else if (i > 0){
    _return = true;
    }
      console.log("contract responded");
      return _return;
    }

    function checkUpload(){
        var i = 0;
        chk = true;
        (function myLoop (i) {          
            setTimeout(function () {   
                console.log("checking response");
                var checkRespond =  checkConnectedPeer();
                console.log(checkRespond);
                if (checkRespond){
                    showalert('Sindo uploaded his data. He is now visualizing your SAS.');
                    //setTimeout(function () { openlink('main1L.html');}, 10000)
                                                                             
                    } 
                    //else{showalert("Sindo didn't uploaded his data yet");}                  
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
                {   showalert('We are setting a smart contract for you.');
                    openlink('main12.html');                                                         
                }     
            }                
           if ((10000)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
        }, 20000)
     })(10000);  

    if (i==0){
    _return = false;
    }
    else if (i > 0){
    _return = true;
    }
      console.log("contract responded");
      return _return;
    }


    function setSC(){
        (function () { 
                    //StartService()
                    console.log(connectedPeers())
                    openlink('main11.html')
                    i=0;
                }, 50000);
          }

          function sendDataProduct(){
    var d = new Date();
    //check = setScReqValue();
    var answer = window.confirm('Your are about to Transfer your data. Do you really want to do this?');
            if (answer){
                showalert('We are trying to reach Mero. SAS will be send shortly!');
                DeleteDB();
        removeConnectedPeer();
            //StartService()
            doAsync().then(function(){
                
                setTimeout(function () {
                    if (checkConnectedPeer()){
                        showalert('SAS has been send to sindo!');
                        removeConnectedPeer();
                        openlink('main1L.html')
                        i=0; 
                    }
                    else{
                        showalert('There is some network issue. We are trying to establish connection. Please have patience!');
                        removeConnectedPeer(); 
                    }
                }, 40000)
              });
            }
        }

    function StartService(){
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
          
        function startCallback() {
            tucanaPlatform.startService();
        }
        console.log('I am Init')
        fetch('../EVAREST_HMI.json')
            .then((response) => {
                return response.json();
            }).then(json => {
                var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(json);
                tucanaPlatform.createSmartServiceConfiguration(sscItem)
            }).then(() => {
                tucanaPlatform.getSmartServiceConfigurationItemIds().then((ids) => {
                    console.log(ids);
                    uiAdapter.showService(ids, startCallback);
                }, () => {
                    console.log("service id fetch error");
                });
            });
    }
    async function doAsync () {
        // we are now using promise all to await all promises to settle
        var responses = await Promise.all([StartService()]);
        return responses;
    }
    async function doAsyncB () {
        // we are now using promise all to await all promises to settle
        var responses = await Promise.all([StartServiceB()]);
        return responses;
    }
    function TrequestContract() {
        var d = new Date();
        //check = setScReqValue();
        var answer = window.confirm('Your are about to request Sindo for SAS. Do you really want to do this?');
        if (answer){
            showalert('Your request has been send to sindo!');
                //StartService()
                refreshIndex();
                setTimeout(function () {
                    if (!checkConnectedPeer()){ 
                        showalert('There is some network issue please try again after some time!');
                        checkResponse();
                    }
                    else {
                        openlink("main02.html")
                    }
                }, 20000)
                
            }
    }
    function TuploadData() {
        var d = new Date();
        //check = setScReqValue();
        alert('Your are about to upload your data.');
        if (true){

            localStorage.removeItem("Connected peer");
            if(localStorage.getItem("producer")  == "true"){
            const reader = this.JSONReader((result) => {
                console.log(result)
                
            });
            console.log(reader);
            //refreshIndex();
            //doAsync();
            setTimeout(function () {
                //if(!this.ids == 'USER_NA'){
                    this.checkSAS();
                //}
                },10000);
        }
        //StartService()                 
                    /*setTimeout(function () {
                        
                        refreshIndex();
                        showalert('We are redirecting you to visualization'); 
                        setTimeout(function () {
                            openlink('mainL.html')
                        }, 20000)
                        

                    }, 20000)*/
                }
            }
    function refreshIndex(){
        //childWindow.location.href="../../../index.html";
        var newtab = window.open('../../../index.html');
        newtab.document.location.reload(true);

    }

    function checkSAS(){
        
        const _this = this;
        (function myLoop (i) { 
            const __this = _this;       
            setTimeout(function () { 
                if (true/*localStorage.getItem("Connected peer")*/){ 
                    var answer = window.confirm('Your data has been aggregated. You want to download it.');
                    if (answer){
                        __this.createSAS();
                        alert('Data downloaded');
                    }                                                        
                }
                else{
                    alert('You didnt received any SAS yet.');
                }                   
               if ((10000)) myLoop(--i);
            }, 30000)  
         })(10000);


    }
    function createSAS(){
        const _this = this;
        //JSONObject js = new JSONObject();
        var dummy = _this.result["data"];
        
        var SAS =  {
            id: _this.result["id"],
            version: _this.result["version"],
            name: _this.result["name"],
            descriptionText: _this.result["descriptionText"],
            data: [{
                "Num1": "X"},{
                "Num2": "X"},{
                "Res": parseInt((dummy[0]['Num1'])) + parseInt((dummy[1]['Num2']))
            }],
            context: _this.result["context"]
        };
        console.log(SAS)
        console.log(_this.result)
        _this.downloadObjectAsJson(SAS, 'SAS');
    }
    
    function downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        location.reload();
      }
    
    function JSONReader(completed = null) {
        showalert('Your data has been uploaded. We are aggregating your data according to provided SAS by sindo');
        this.onCompleted = completed;
        this.result = undefined;
	    this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.accept = 'text/json|application/json';
        this.input.addEventListener('change', this.onChange.bind(this), false);
        this.input.style.display = 'none';
        document.body.appendChild(this.input);
        this.input.click();
    }
 
    function destroy() {
        this.input.removeEventListener('change', this.onChange.bind(this), false);
        document.body.removeChild(this.input);    
    }
 
    function onChange(event) {
	if (event.target.files.length > 0) {
            this.readJSON(event.target.files[0]);
        }
    }
 
    function readJSON(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target.readyState === 2) {
                this.result = JSON.parse(reader.result);
                if (typeof this.onCompleted === 'function') {
                    this.onCompleted(this.result);
                }
		this.destroy();
            }
        };
        reader.readAsText(file);
    }
 
    function read(callback = null) {
        return new this.JSONReader(callback);
    }
    
class Tmin extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);
        this._this = this;
        this.data = [];
        this.dataId = id + Date.now();
        console.log('I am in Tmin')
    }


    async activate() {
        await this.initialize();
        this.running = true;
        const _this = this;

        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));

    }
    addDataProducts() {
        $.getJSON("../products/products.json", function (json) {
            for (i = 0; i < json.length; i++) {
                index.addDoc(json[i]);
            }
        });
    }
    
    predictDataproduct(customer_msg) {
        result = index.search(customer_msg);
        return result;
    }
    
    createIntents() {
        $.getJSON("../conversation.json", function (json) {
            for (i = 0; i < json.length; i++) {
                for (j = 0; j < (json[i].question).length; j++) {
                    addIntent(json[i].question[j], json[i].intent);
                }
            }
            intents = json;
        });
    }
    
    addIntent(msg, intent) {
        nlp.addDocument(msg, intent, { fromFullSentence: true, expandIntent: true });
    }
    
    getIntent(msg) {
        intent = nlp.test(msg).intent;
        return intent;
    }

    questionMessage() {
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
            storeData();
            
        }
        else{
            alert("Please use search bar below to tell us, how can we help you?");
        }
    }
    questionMessagewithAlert() {
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
    
    extractDetails(dp, intent) {
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
    
    generateAnswer(intent, customer_msg) {
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
    
    
    show_vis(link) {
      window.open("https://localhost:5000/showcases/DataProducts/" + link );
    }
    
    
    printAnswerAndButton(value, button_text, button_id, link) {
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
    openlink(link) {
        window.close();
        if (localStorage.getItem("producer") == "true") {role = "producer"}
        else if (localStorage.getItem("provider") == "true") {role = "provider"}
        else if (localStorage.getItem("guest") == "true") {role = "guest"}
    
        window.open("../html/" + link + "?role=" + role + "?name=" + localStorage.getItem("name"));
        
    }
    notify(newData) {
        const _this = this;
        _this.result = newData;
        console.log('data in Tmin');
        console.log(newData);


    }


    terminate() {
    }

}

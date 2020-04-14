class PeerProvider extends tucana.minion.Cmin {
 
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
        console.log('I am in Peer Communicator A')
    }

    async activate() {
        const _this = this;
        _this.initialize();
        this.running = true;
        var prop =[[],"false","true","false","true","k","n"];
        console.log("Defined Properties in A");
        console.log(prop);
        this.ids = await _this.dataAccessService.getFilteredPeerIds(prop);
        console.log("connected peers from A");
        console.log(this.ids);
        if(localStorage.getItem("producer")  == "true"){
            _this.created = true;
            const reader = this.JSONReader((result) => {
                _this.result = result;
                console.log(result)
                console.log(_this.result)
            });
            console.log(reader);
            setTimeout(function () {
                //if(!this.ids == 'USER_NA'){
                    _this.connection(_this.result);
                //}
                },30000);
        }
    }
    connection(result){
        const _this = this;
        if (this.running){
            if (this.ids.lenght == 0){
                console.log("no id connected");
            }
            else{
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
           
            console.log("only prediction result sent to store  "  ,this.data);
            console.log("this.dataID");
            console.log(this.dataId);
            console.log("this.data");
            console.log(this.data);
            this.broadcastDataCreateOperation("Received", result, broadcastConfig)
                    .then(function(res){
                        console.log(res);
                    });
            }

        }
        else if (localStorage.getItem("Connected peer")){
            console.log("some id is connected");
            this.peerID = [];
            this.peerID[0] = localStorage.getItem("Connected peer");
            this.LocalID = localStorage.getItem("id");
            console.log(this.peerID);
            console.log(this.LocalID);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.LocalID, this.peerID,  this.model.BROADCAST_TYPE.UPEER, this.model.BROADCAST_CONDITION.ALL,null);
            console.log("only prediction result sent to store  "  ,this.data);
            this.broadcastDataCreateOperation("Received", result, broadcastConfig);
        }
        setTimeout(function () {
                localStorage.removeItem("Connected peer");
                _this.checkSAS();
            },10000);
        
    }

    checkSAS(){
        
        const _this = this;
        (function myLoop (i) { 
            const __this = _this;       
            setTimeout(function () { 
                if (localStorage.getItem("Connected peer")){ 
                    var answer = window.confirm('SAS has been send to you. You want to download it.');
                    if (answer){
                        __this.createSAS();
                        alert('SAS downloaded');
                    }                                                        
                }
                else{
                    alert('You didnt received any SAS yet.');
                }                   
               if ((20000)) myLoop(--i);
            }, 70000)  
         })(10000);


    }
    createSAS(){
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
    

 
    destroy() {
        this.input.removeEventListener('change', this.onChange.bind(this), false);
        document.body.removeChild(this.input);    
    }
 
    onChange(event) {
	if (event.target.files.length > 0) {
            this.readJSON(event.target.files[0]);
        }
    }
 
    readJSON(file) {
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
 
    read(callback = null) {
        return new this.JSONReader(callback);
    }
    
    

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this. data = [];
    }

    notify(newData) {
        this.result = newData;  
        console.log(this.ids);  
        this.data.push(newData);
            
    }
}
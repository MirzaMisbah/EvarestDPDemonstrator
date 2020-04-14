class PeerProducer extends tucana.minion.Cmin {
 
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
        console.log('I am in Peer Communicator B')
        this._accessdata = tucana.adapter.IndexedDBDatabaseHandler;

    }

    async activate() {
        const _this = this;
        _this.initialize();
        this.running = true;
        var prop =[[],"true","false","false","true","k","n"];
        console.log("Defined Properties in B");
        console.log(prop);
        this.ids = await _this.dataAccessService.getFilteredPeerIds(prop);
        this.domainItemIds = await _this.dataAccessService.getDomainItemIds();
        //const ReadResults = await this.get('indexeddb://my-model-1');
        //this.model = await this.readData();
        //console.log(this.model)

        //const domainItem = new this.model.DomainItem(this.instanceId, 'Received');
        /* await _this.dataAccessService.readData("Received").then(function (res) {
            if (res.response.res != null) {
                _this.data = res.response.res.object;
                console.log(res.response.res.object);
            }
        }); */
        console.log("connected peers from B");
        console.log(this.ids);
        //console.log(this.data.read())
        //console.log(await this.data.load());
        if(localStorage.getItem("provider")  == "true"){
            this.ReceivedData();
        }
        //_this.connection();


    }
    async ReceivedData(){
        const _t = this;
        //this.domainItemIds = await this._accessdata.domainItemIds();
        /* await this.dataAccessService.readData("Received").then(function (res) {
            if (res.response.res != null) {
                this.data = res.response.res.object;
                console.log(res.response.res.object);
                console.log("line 42")
            }
            else{
                console.log("line 45") 
            }
        });
         */
        (function myLoop (i) {    
            const _this = _t;      
            setTimeout(function () {
                const __this = _this; 
                if (localStorage.getItem("Connected peer")){ //this.readData("Received")
                    var answer = window.confirm('You received some data. You want to send SAS.');
                    if (answer){
                        localStorage.removeItem("Connected peer");
                        setTimeout(function () {
                            const ___this = __this; 
                            ___this.connection();
                        }, 10000)                                                
                }
            }
                else{
                    if(this.ids == 'USER_NA'){
                        alert('No other user is connected right now to send data');
                    }
                    else{
                        alert('Some other user is connected but you dont received any data yet');
                    }
                }                  
               if ((20000)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
            }, 30000)
         })(10000);
    }

    connection(){
        (function myLoop (i) {    
            const _this = this;      
            setTimeout(function () {
                const _this = __this;
                if(!(localStorage.getItem("Connected peer"))){
                    if (__this.running){

                        if (__this.ids.lenght == 0){
                            console.log("no id connected");
                        }
                        else{
                        const broadcastConfig = new __this.model.BroadcastConfiguration(__this.dataAccessService.getLocalID(),  __this.ids,  __this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
                    
                        console.log("only prediction result sent to store  "  ,__this.data);
                        console.log("_this.dataID");
                        console.log(__this.dataId);
                        console.log("_this.data");
                        console.log(__this.data);
                        __this.broadcastDataCreateOperation(__this.dataId, __this.data, broadcastConfig)
                                .then(function(res){
                                    console.log(res);
                                });
                            }
                        }
                    }
                    else{i=0;}
                
                
            if ((20000)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
            }, 30000)
        })(10000);
    }
    generateSAS(){
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
                "Op": "+" 
            }],
            context: _this.result["context"]
        };
        console.log(SAS)
        console.log(_this.result)
        _this.downloadObjectAsJson(SAS, 'SAS');
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
        console.log("this.running = " + this.running);
        if(this.running) {       
            this.data.push(newData);
            console.log("data pushed")
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            console.log("broadcast configs set")
            this.broadcastDataCreateOperation(this.dataId, "hi", broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}
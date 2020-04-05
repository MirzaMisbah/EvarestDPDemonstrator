class PeerProducer extends tucana.minion.Cmin {
 
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
        console.log('I am in Peer Communicator B')

    }

    async activate() {
        const _this = this;
        _this.initialize();
        this.running = true;
        var prop =[[],"true","false","false","true","k","n"];
        console.log("Defined Properties in B");
        console.log(prop);
        this.ids = await _this.dataAccessService.getFilteredPeerIds(prop);
        console.log("connected peers from B");
        console.log(this.ids);
        var myIndex = objectStore.index('index');
                var getAllKeysRequest = myIndex.getAllKeys();
                getAllKeysRequest.onsuccess = function() {
                console.log(getAllKeysRequest.result);}
        //_this.connection();

    }
    ReceivedData(){
        (function myLoop (i) {          
            setTimeout(function () { 
                var myIndex = objectStore.index('index');
                var getAllKeysRequest = myIndex.getAllKeys();
                getAllKeysRequest.onsuccess = function() {
                console.log(getAllKeysRequest.result);
                }  
                if (checkRespond){
                    showalert('Sindo accepted your request. We are setting a smart contract for you.');
                    setTimeout(function () { 
                    openlink('main02.html');
                    }, 30000)                                                         
                    }
                    else{
                        showalert("Sindo didn't accepted your request yet. Please have patience!");
                    }                   
               if ((20000)) myLoop(--i);      //  decrement i and call myLoop again if i > 0
            }, 30000)
         })(10000);
    }
    connection(){
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
            this.broadcastDataCreateOperation(this.dataId, this.data, broadcastConfig)
                    .then(function(res){
                        console.log(res);
                    });
            }

        }
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
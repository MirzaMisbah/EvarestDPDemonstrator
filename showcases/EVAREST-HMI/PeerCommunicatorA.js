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
        await _this.initialize();
        this.running = true;
        var prop =[[],"false","true","false","true","k","n"];
        console.log("Defined Properties in A");
        console.log(prop);
        this.ids = await _this.dataAccessService.getFilteredPeerIds(prop);
        console.log("connected peers from A");
        console.log(this.ids);
        _this.connection();
        
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
        else if (localStorage.getItem("Connected peer")){
            console.log("some id is connected");
            this.peerID = [];
            this.peerID[0] = localStorage.getItem("Connected peer");
            this.LocalID = localStorage.getItem("id");
            console.log(this.peerID);
            console.log(this.LocalID);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.LocalID, this.peerID,  this.model.BROADCAST_TYPE.UPEER, this.model.BROADCAST_CONDITION.ANY,null);
            console.log("only prediction result sent to store  "  ,this.data);
            this.broadcastDataCreateOperation(this.dataId, this.data, broadcastConfig);
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
        console.log(this.ids);  
        this.data.push(newData);
            
    }
}
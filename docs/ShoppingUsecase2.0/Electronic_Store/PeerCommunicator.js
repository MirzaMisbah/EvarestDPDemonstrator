class TestPeerCommunicator extends tucana.minion.Cmin {

    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
    }

    async activate() {
        await this.initialize();
        this.running = true;
        
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

    notify(newData) {
        if(this.running && newData != 'undefined') { 
            this.data = [];
            this.data.push(newData["cust"]);
            console.log(this.data);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.data,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            console.log("only prediction result sent to store  "  ,newData);
            this.broadcastDataCreateOperation("offer", newData, broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}
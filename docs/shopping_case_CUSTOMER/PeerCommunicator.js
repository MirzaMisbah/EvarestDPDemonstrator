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
        var prop =[[],"false","false","false","false",["store"],["store"]];
        this.ids = await this.dataAccessService.getFilteredPeerIds(prop);
        this. data = [];
        
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this. data = [];
    }

    notify(newData) {
        if(this.running) {       
            this.data.push(newData);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            console.log("only prediction result sent to store  "  ,this.data);
            this.broadcastDataCreateOperation(this.dataId, this.data, broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}

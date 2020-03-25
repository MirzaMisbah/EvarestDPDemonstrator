class TestPeerCommunicator extends tucana.minion.Cmin {

    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = "DEL";
        this.data = [];
    }

    async activate() {
        await this.initialize();
        this.running = true;
        var prop =[[],"false","false","false","false",["Delivery"],["Delivery"]];
        this.ids = await this.dataAccessService.getFilteredPeerIds(prop);
        this.data = [];
        
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

    notify(newData) {
        if(this.running) { 
            console.log("only prediction result sent to store  "  ,newData);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            
            this.broadcastDataCreateOperation(this.dataId, newData, broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}
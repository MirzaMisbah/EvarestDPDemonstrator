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
        var prop =[[],"false","false","false","false",["op"],["op"]];
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
            this.data = [newData[newData.length-1]];
            console.log("only prediction result sent to store  "  ,newData,this.data);   
            
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.data ,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            
            this.broadcastDataCreateOperation(this.dataId,newData, broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}
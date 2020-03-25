class TestPeerCommunicator extends tucana.minion.VisualizationCmin {

    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        var prop =[[],"false","false","false","false",["test"],[""]];
        this.ids = await this.dataAccessService.getFilteredPeerIds(prop);
        console.log(this.ids)
        
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    notify(newData) {
        if(this.running) {       
            
            const domainItem = new this.model.DomainItem(this.instanceId, newData);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            const crudOperation = new this.model.CRUDOperation(this.model.CRUD_OPERATION_TYPE.CREATE, this.model.OBJECT_TYPE.DATA, domainItem, null, broadcastConfig);
            
            this.dataAccessService.requestCRUDOperation(crudOperation)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}
class peer extends tucana.minion.Cmin {

    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = "DEL";
        this.data = [];
    }

    async activate() {}
    terminate() {}
    notify(newData) {}
    senddata(){
        console.log("some id is connected");
        this.peerID = [];
        this.peerID[0] = localStorage.getItem("Connected peer");
        this.LocalID = localStorage.getItem("id");
        console.log(this.peerID);
        console.log(this.LocalID);
        const broadcastConfig = new this.model.BroadcastConfiguration(this.LocalID, this.peerID,  this.model.BROADCAST_TYPE.UPEER, this.model.BROADCAST_CONDITION.ANY,null);
        console.log("only prediction result sent to store  "  ,this.data);
        this.broadcastDataCreateOperation(this.dataId, this.data, broadcastConfig)
                .then(function(res){
                    _this.minionController.notify(_this,res.response[0].res.response.res.object)
                    console.log(res);
                }); 
    }
}
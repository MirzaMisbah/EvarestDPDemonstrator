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
        var prop =[[],"true","false","false","false","k","n"];
        console.log("Defined Properties in B");
        console.log(prop);
        this.ids = await _this.dataAccessService.getFilteredPeerIds(prop);
        console.log("connected peers from B");
        console.log(this.ids);
        _this.connection();

    }
    connection(){
        if (this.running){
            if (this.ids.lenght == 0){
                console.log("no id connected");
            }
            else{
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ALL,null);
           
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
    async receiveService() {
        console.log("broadcasting service")
        var request = window.indexedDB.open("sscItem");
        this.readyToBroadCast = false;
        var onSuc = function (event) {
            var db = event.target.result;
            // Erstelle ein ObjectStore für diese Datenbank
            db.transaction("sscItem", "readwrite").objectStore("sscItem").put('Service').onsuccess = async function (event) {
                this.service = event.target.result;
                console.log(this.service);
            }.then((response) => {
                return response.json();
            }).then(json => {
                var sscItem = tucana.model.SmartServiceConfigurationItem.fromJSON(this.service);
                tucana.createSmartServiceConfiguration(sscItem)
            }).bind(this)
        request.onsuccess = onSuc.bind(this);
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
        this.service = newData;
        if(newData != null){
            receiveService();
        }
        if(this.running) {       
            this.data.push(newData);
            const broadcastConfig = new this.model.BroadcastConfiguration(this.dataAccessService.getLocalID(),  this.ids,  this.model.BROADCAST_TYPE.UPEER,BROADCAST_CONDITION.ANY,null);
            this.broadcastDataCreateOperation(this.dataId, "", broadcastConfig)
                .then(function(res){
                    console.log(res);
                });
        }
    }
}

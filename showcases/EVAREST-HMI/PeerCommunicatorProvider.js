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
        _this.initialize();
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
        else if (localStorage.getItem("Connected peer") || !localStorage.getItem("Connected peer")){
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
    async broadcastService() {
        console.log("broadcasting service")
        var request = window.indexedDB.open("swComponent");
        console.log("swComponent opened")
     

        this.readyToBroadCast = false;
        var onSuc = function (event) {
        console.log("swComponent opened succesfully")

        var db = event.target.result;
        const tx = db.transaction("swComponent", 'readwrite')
        const store = tx.objectStore("swComponent")
      
        const val = 'hey!'
        const key = 'Hello again'
        const value = store.put(val,'')
        tx.done
            db.transaction("swComponent", "readwrite").objectStore("swComponent").get('./showcases/EVAREST-HMI/Service.js').onsuccess = async function (event) {
                this.modelA = event.target.result;
                console.log(this.modelA);
                for (var i = 0; i < this.ids.length; i++) {
                    var peer = this.ids[i];
                    const broadcastConfig = new this.model.BroadcastConfiguration(this.localId, [peer], this.broadcastCondition, this.broadcastType, null);
                    await this.broadcastDataCreateOperation(this.dataId, {
                        model: this.modelA,
                    }, broadcastConfig).then(function (res) {
                        this.readyToBroadCast = true;
                    }.bind(this));
                }
            }.bind(this)
        }.bind(this);
        request.onsuccess = onSuc.bind(this);
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
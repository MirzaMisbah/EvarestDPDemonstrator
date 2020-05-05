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
        var prop =[[],"false","true","false","false","k","n"];
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

        var db = event.target.result;
        const tx = db.transaction("swComponent", 'readwrite')
        const store = tx.objectStore("swComponent")
        const val = 'hey!'
        const key = 'Hello again'
        const value = store.put(val,'')
        tx.done
            db.transaction("sscItem", "readwrite").objectStore("sscItem").get('Service').onsuccess = async function (event) {
                this.service = event.target.result;
                console.log(this.service);
                for (var i = 0; i < this.ids.length; i++) {
                    var peer = this.ids[i];
                    const broadcastConfig = new this.model.BroadcastConfiguration(this.localId, [peer], this.broadcastCondition, this.broadcastType, null);
                    await this.broadcastDataCreateOperation(this.dataId, {
                        Service: this.service,
                    }, broadcastConfig).then(function (res) {
                        this.readyToBroadCast = true;
                    }.bind(this));
                }
            }.bind(this)
        }.bind(this);
        request.onsuccess = onSuc.bind(this);
    }
    checkSAS(){
        const result
        (async () => {
            //...
          
            const dbName = 'sscItem'
            const storeName = 'TestService'
            const version = 1 //versions start at 1
            const db = await openDB(dbName, version, {
              upgrade(db, oldVersion, newVersion, transaction) {
                result = db.createObjectStore(storeName)
              }
            })
          })()

        var answer = window.confirm('Der von Sindo empfangene Service sagt "' + this.result["descriptionText"] + '". Ist es nützlich für Ihre Daten ?');
        if (answer){
        const _this = this;
        (function myLoop (i) { 
            const __this = _this;       
            setTimeout(function () { 
                if (true/*localStorage.getItem("Connected peer")*/){ 
                    var answer = window.confirm('Ihre Daten wurden aggregiert. Sie möchten es herunterladen.');
                    if (answer){
                        __this.createSAS();
                        alert('Daten heruntergeladen');
                    }                                                        
                }
                else{
                    alert('You didnt received any SAS yet.');
                }                   
               if ((10000)) myLoop(--i);
            }, 10000)  
         })(10000);
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
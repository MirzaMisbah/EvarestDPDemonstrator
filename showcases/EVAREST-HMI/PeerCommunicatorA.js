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
        if(localStorage.getItem("producer")  == "true"){
                _this.created = true;
                const reader = this.JSONReader((result) => {
                    _this.result = result;
                    console.log(result)
                    console.log(_this.result)
                });
                console.log(reader);
            }
        setTimeout(function () {
            _this.connection(_this.result);
            },50000);
        
        
    }
    connection(result){
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
            this.broadcastDataCreateOperation("Received", result, broadcastConfig)
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
            const broadcastConfig = new this.model.BroadcastConfiguration(this.LocalID, this.peerID,  this.model.BROADCAST_TYPE.UPEER, this.model.BROADCAST_CONDITION.ALL,null);
            console.log("only prediction result sent to store  "  ,this.data);
            this.broadcastDataCreateOperation("Received", result, broadcastConfig);
        }
    }

    
    JSONReader(completed = null) {
        this.onCompleted = completed;
        this.result = undefined;
	    this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.accept = 'text/json|application/json';
        this.input.addEventListener('change', this.onChange.bind(this), false);
        this.input.style.display = 'none';
        document.body.appendChild(this.input);
        this.input.click();
    }
 
    destroy() {
        this.input.removeEventListener('change', this.onChange.bind(this), false);
        document.body.removeChild(this.input);    
    }
 
    onChange(event) {
	if (event.target.files.length > 0) {
            this.readJSON(event.target.files[0]);
        }
    }
 
    readJSON(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target.readyState === 2) {
                this.result = JSON.parse(reader.result);
                if (typeof this.onCompleted === 'function') {
                    this.onCompleted(this.result);
                }
		this.destroy();
            }
        };
        reader.readAsText(file);
    }
 
    read(callback = null) {
        return new this.JSONReader(callback);
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
class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'TestDataReader' + Date.now();
        this.created = false;
        this.data = [];
        this.last_offer = {};

    }

    

    saveStoreData(id,data) {
        if (this.created) {
            this.updateData(id, data)
        } else {
            this.saveData(id, data);
            this.created = true;
        }
    }
    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true; 


    }
    async saveStoreData(id,data) {
        const _this = this;
            
            await _this.readData(id).then(function (res) {
                if(res.response.res != null){
                _this.data = res.response.res.object;                    
                console.log(res.response.res.object);                    
                }
                
                
            });
            _this.data.push(data);
            this.updateData(id.trim(), _this.data);
            
        
        
    }

    notify(newData) {
        var obj = newData.getObject();
        //this.saveStoreData("Del",obj);

        if (this.created) {
            this.last_offer = obj
        }
        console.log(Date.now(), JSON.stringify(obj) !== JSON.stringify(this.last_offer));
        if (JSON.stringify(obj) !== JSON.stringify(this.last_offer)) {
            this.last_offer = obj;
            this.saveStoreData("Del",obj);
            this.minionController.notify(this, this.data);
            
        }
        else if (this.created == true) {
            this.created = false;
            this.saveStoreData("Del",obj);
            this.minionController.notify(this, this.data);
            
        }
    }

    terminate() {
        this.running = false;
    }
}
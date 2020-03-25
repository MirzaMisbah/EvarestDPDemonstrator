class Pmin extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'Pmin' + Date.now();
        this.created = false;
        this.data = [];
        console.log('I am in Pmin')

    }

    async activate() {
        this.initialize();
        this.running = true;
        const _this = this;
        
        if(localStorage.getItem("role")){
            if(localStorage.getItem("producer")  == "true"){_this.userType = 'producer'}
            else if(localStorage.getItem("provider") == "true"){_this.userType = 'provider'}
            else {_this.userType = 'guest'}
        }
        else{_this.userType = 'guest'}
        
        _this.result = {
            userId: localStorage.getItem("id"),
            userType: _this.userType
        };
        /**
        * Pushing data    
        */
        _this.data.push(_this.result);

        /**
         * Updating data, into data stream    
         */
        if (_this.created) {
            await _this.updateData(_this.dataId, _this.data)
        }

        /**
         * Savinging data, if it is first data stream    
         */
        else {
            await _this.saveData(_this.dataId, _this.data);
            _this.created = true;
        }
        //console.log(_this.result)
        /**
         * Notifying the next minion     
         */
        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));
        //console.log(_this.dataAccessService.getLocalID());
        //console.log((_this, JSON.parse(JSON.stringify(_this.readData(_this.dataAccessService.getLocalID())))));

    }

    notify(newData) {}

    terminate() {
        this.running = false;
    }
}
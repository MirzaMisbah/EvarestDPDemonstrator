class linearAcceleration extends tucana.minion.Pmin {
    

    /**
    * Predefining variables in constructor
    * Saves the result of Tmin in IndexedDB
    * @var {Array} data: Data stream
    * @var {boolean} created: To check existence 
    * @var {Array} result: 2D Array of timestamp, accelerationX, accelerationY, accelerationZ 
    */
    constructor(dataAccessService, minionController, id, dependencies=[]) {
        super(dataAccessService, minionController, id, dependencies);
        this.data = [];
        this.dataId = id + Date.now();
        this.created = false;
	this.result = null;
    }

	
    /**
    * Tiggered to activate the minion   
    */
    async activate() {
        await this.initialize();
        const _this = this;
        this.running = true;
        this.accelerator = new LinearAccelerationSensor ();
        this.accelerator.start();
        

        /**
        * Setting time interval for data collection as per required window   
        */
	this.loop = setInterval(async () => {
		
            /**
            * If the required values from sensor are null, setting it to 0   
            */
            if(_this.accelerator.x == null && _this.accelerator.y == null && _this.accelerator.z == null)
            {
                _this.result = {
                    timestamp : Date.now(),
                    type : 'linear_acceleration',
                    valueContext : ['axx_x', 'axx_y', 'axx_z'],
                    value : [0, 0, 0],
                    '[Acc-X Acc-Y Acc-Z]' : [0, 0, 0]
                };
    

            }
	    
            /**
            * If the required values from sensor are non-null, updating the result    
            */
            else
            {
                _this.result = {
                    timestamp : Date.now(),
                    type : 'linear_acceleration',
                    valueContext : ['axx_x', 'axx_y', 'axx_z'],
                    value : [_this.accelerator.x, _this.accelerator.y, _this.accelerator.z],
                    '[Acc-X Acc-Y Acc-Z]' : [_this.accelerator.x, _this.accelerator.y, _this.accelerator.z]
                };

            }
		
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
		
	    /**
            * Notifying the next minion     
            */
            _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));
        }, 100);
    }

    notify(newData) {
        const _this = this;
        return _this.result;
    }

    terminate() {
        clearInterval(this.loop);
        this.running = false;
    }
}

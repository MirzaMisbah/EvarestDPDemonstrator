class geolocation extends tucana.minion.Pmin {
    
    /**
    * Predefining variables in constructor
    * Saves the result of Tmin in IndexedDB
    * @var {Array} data: Data stream
    * @var {boolean} created: To check existence 
    * @var {Array} result: 2D Array of timestamp, latitude, longitude and accuracy  
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
        const _this = this;
        await this.initialize();
        this.running = true;
	  
	/**
        * Setting time interval for data collection as per required window   
        */
        this.loop = setInterval(async () => {
            var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
            };
		
	    /**
            * Updating the variable as per values from the sensor    
            */
            navigator.geolocation.getCurrentPosition( function (location) {
                _this.latitude = location.coords.latitude;
                _this.longitude = location.coords.longitude;
                _this.accuracy = location.coords.accuracy;
              });
		
	    /**
            * If the required values from sensor are null, setting the variables to 0   
            */
            if(_this.latitude == null && _this.longitude == null && _this.accuracy == null)
            {
                _this.latitude = 0;
                _this.longitude = 0;
                _this.accuracy = 0;
              
            }
		
	    /**
            * Updating the result    
            */
            _this.result = {
                timestamp : Date.now(),
                type : 'location',
                valueContext : ['latitude', 'longitude', 'accuracy'],
                value : [_this.latitude, _this.longitude, _this.accuracy],
                '[Lat Lon Acc]' : [_this.latitude, _this.longitude, _this.accuracy]
            };
		
		
            /**
            * Pushing data    
            */
            _this.data.push(this.result);
		
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
            _this.minionController.notify(_this, JSON.parse(JSON.stringify(this.result)));
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

class geolocation extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, dependencies=[]) {
        super(dataAccessService, minionController, id, dependencies);
        this.data = [];
        this.dataId = id + Date.now();
        this.created = false;
        this.result = null;
   
    }

    async activate() {
        const _this = this;
        await this.initialize();
        this.running = true;
        this.loop = setInterval(() => {
            var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
            };
            navigator.geolocation.getCurrentPosition(function (location) {
                _this.latitude = location.coords.latitude;
                _this.longitude = location.coords.longitude;
                _this.accuracy = location.coords.accuracy;
              });
            if(_this.latitude == null && _this.longitude == null && _this.accuracy == null)
            {
                _this.latitude = 0;
                _this.longitude = 0;
                _this.accuracy = 0;
              
            }
            this.result = {
                timestamp : Date.now(),
                type : 'location',
                valueContext : ['latitude', 'longitude', 'accuracy'],
                value : [_this.latitude, _this.longitude, _this.accuracy],
                '[Lat Lon Acc]' : [_this.latitude, _this.longitude, _this.accuracy]
            };
            this.data.push(this.result);
            if (this.created) {
                this.updateData(this.dataId, this.data)
            } else {
                this.saveData(this.dataId, this.data);
                this.created = true;
            }
            this.minionController.notify(this, this.result);
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
	
    async success(pos, result) {
        let crd = pos.coords;
        _latitude = crd.latitude;
        _longitude = crd.longitude;
        _accuracy = crd.accuracy;
    }

    async error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}

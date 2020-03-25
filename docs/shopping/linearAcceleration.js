class linearAcceleration extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, dependencies=[]) {
        super(dataAccessService, minionController, id, dependencies);
        this.data = [];
        this.dataId = id + Date.now();
        this.created = false;
	    this.result = null;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.accelerator = new LinearAccelerationSensor ();
        this.accelerator.start();
        this.loop = setInterval(() => {

             /**window.ondevicemotion = function(event) {
                var accelerationX = event.accelerationIncludingGravity.x;
                console.log(accelerationX)
                var accelerationY = event.accelerationIncludingGravity.y;
                console.log(accelerationY)
                var accelerationZ = event.accelerationIncludingGravity.z;
                console.log(accelerationX)
            }*/
            if(this.accelerator.x == null && this.accelerator.y == null && this.accelerator.z == null)
            {
                this.result = {
                    timestamp : Date.now(),
                    type : 'linear_acceleration',
                    valueContext : ['axx_x', 'axx_y', 'axx_z'],
                    value : [0, 0, 0],
                    '[Acc-X Acc-Y Acc-Z]' : [0, 0, 0]
                };
    

            }
            else
            {
                this.result = {
                    timestamp : Date.now(),
                    type : 'linear_acceleration',
                    valueContext : ['axx_x', 'axx_y', 'axx_z'],
                    value : [this.accelerator.x, this.accelerator.y, this.accelerator.z],
                    '[Acc-X Acc-Y Acc-Z]' : [this.accelerator.x, this.accelerator.y, this.accelerator.z]
                };

            }
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
}

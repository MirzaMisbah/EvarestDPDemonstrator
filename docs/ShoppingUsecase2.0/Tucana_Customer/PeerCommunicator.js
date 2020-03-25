class TestPeerCommunicator extends tucana.minion.Cmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
    }
    async activate() {
        await this.initialize();
        this.running = true;
        this.data = [];
        console.log("Activate Store data catch");
        var prop = [[], "false", "false", "false", "false", ["Store"], ["Store"]];
        this.ids = await this.dataAccessService.getFilteredPeerIds(prop);
        this.getAllStore();

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        console.log("PC Terminated")
        this.running = false;
        this.data = [];
    }

    getAllStore() {
        const _this = this;
        console.log("only prediction result sent to store  ", _this.ids);
        this.data.push(_this.dataAccessService.getLocalID());
        for (let i = 0; i < this.ids.length; i++) {
            setTimeout(function timer() {   //  call a 3s setTimeout when the loop is called
                // alert('hello'+_this.ids[i]+i);
                 var loc = [_this.ids[i]];
                const broadcastConfig = new _this.model.BroadcastConfiguration(_this.dataAccessService.getLocalID(), loc, _this.model.BROADCAST_TYPE.UPEER, BROADCAST_CONDITION.ANY, null);

                _this.broadcastDataReadOperation("Items", broadcastConfig)
                    .then(function (res) {
                        console.log(res.response[0].res.response.res.object);
                        _this.minionController.notify(_this,res.response[0].res.response.res.object)


                    });          //  your code here
            }, i * 4000);
        }





    }
    notify(newData) {
        this.running = true;
        if (this.running) {
            console.log("notify Store data catch");

        }
    }
}
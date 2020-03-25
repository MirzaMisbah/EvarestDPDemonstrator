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
        var prop = [[], "false", "false", "false", "false", ["Store"], ["Store"]];
        this.ids = await this.dataAccessService.getFilteredPeerIds(prop);
        this.data = [];

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

    notify(newData) {
        if (this.running) {
            this.data = [];
            const _this = this;
            console.log("only prediction result sent to store  ", newData, _this.ids);
            newData.push(_this.dataAccessService.getLocalID());
            _this.data.push(newData);
            console.log(_this.data);
            var loc = [_this.ids[0]];
            const broadcastConfig = new _this.model.BroadcastConfiguration(_this.dataAccessService.getLocalID(), loc, _this.model.BROADCAST_TYPE.UPEER, BROADCAST_CONDITION.ANY, null);

            _this.broadcastDataCreateOperation(_this.dataId, _this.data, broadcastConfig)
                .then(function (res) {
                    console.log(res);
                    var loc = [_this.ids[1]];
                    const broadcastConfig1 = new _this.model.BroadcastConfiguration(_this.dataAccessService.getLocalID(), loc, _this.model.BROADCAST_TYPE.UPEER, BROADCAST_CONDITION.ANY, null);

                    _this.broadcastDataCreateOperation(_this.dataId, _this.data, broadcastConfig1)
                        .then(function (res) {
                            console.log(res);
                        });
                });

        }
    }
}
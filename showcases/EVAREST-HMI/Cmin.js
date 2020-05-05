class Cmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.model = tucana.model;
        console.log('I am in Cmin')
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    setActive(active) {
        this.active = active;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        var _this = this;
        console.log(this.instanceId);
        this.uiAdapter.checkId("service");
        this.uiAdapter.requestInput(this.instanceId, "binary", "", this.setActive.bind(this));
        this.uiAdapter.requestInput(this.instanceId, "action", "", function () {
            _this.uiAdapter.addData(_this.instanceId, true);
            _this.uiAdapter.sendNotification(_this.instanceId, "");
        });
        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));

    }
    

    notify(newData) {
        const _this = this;
        _this.result = newData;
        console.log('data in Cmin');
        console.log(newData);

        


    }

}
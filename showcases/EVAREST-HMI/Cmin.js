class Cmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.model = tucana.model;
        this._minionController = this.minionController;
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
        const _this = this;
        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));

    }

    notify(newData) {
        const _this = this;
        _this.result = newData;
        console.log('data in Cmin');
        console.log(newData);

        


    }

}
class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies=[]) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'TestDataReader' + Date.now();
        this.created = false;
        
    }

    async activate() {
        await this.initialize();
        this.running = true;
    }

    notify(newData) {
        console.log(newData);
        this.minionController.notify(this, newData.getObject().pop());
    }

    terminate() {
        this.running = false;
    }
}

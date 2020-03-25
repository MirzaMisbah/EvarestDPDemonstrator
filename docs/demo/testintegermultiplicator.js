class TestIntegerMultiplicator extends tucana.minion.Tmin {
    constructor(dataAccessService, minionController, id, dependencies = []) {
        super(dataAccessService, minionController, id, dependencies);
        this.data = [];
        this.dataId = id + Date.now();
        this.created = false;
    }

    async activate() {
        await this.initialize();
        this.running = true;
    }

    notify(newData) {

        var result = {
            timestamp: Date.now(),
            value: newData.value[0] * newData.value[1]
        };
        this.data.push(result);
        if (this.created) {
            this.updateData(this.dataId, this.data)
        } else {
            this.saveData(this.dataId, this.data);
            this.created = true;
        }
        this.minionController.notify(this, result);

    }

    terminate() {
        this.running = false;
        this.created = false;
    }
}
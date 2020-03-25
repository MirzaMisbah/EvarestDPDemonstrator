class TestRandomGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, dependencies=[]) {
        super(dataAccessService, minionController, id, dependencies);
        this.data = [];
        this.dataId = 'TestRandomGenerator' + Date.now();
        this.created = false;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.loop = setInterval(() => {
            let randomNumber1 = Math.floor(Math.random() * Math.floor(100));
            let randomNumber2 = Math.floor(Math.random() * Math.floor(100));
            let result = {
                timestamp : Date.now(),
                value : [randomNumber1, randomNumber2]
            };
            this.data.push(result);
            if (this.created) {
                this.updateData(this.dataId, this.data)
            } else {
                this.saveData(this.dataId, this.data);
                this.created = true;
            }
            this.minionController.notify(this, result);
        }, 3000);
    }

    notify(newData) {
        return null;
    }

    terminate() {
        clearInterval(this.loop);
        this.running = false;
    }
}
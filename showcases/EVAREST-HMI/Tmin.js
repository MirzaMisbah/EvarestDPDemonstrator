class Tmin extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);
        this._this = this;
        this.data = [];
        this.dataId = id + Date.now();
        console.log('I am in Tmin')
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
        console.log('data in Tmin');
        console.log(newData);


    }


    terminate() {
    }

}

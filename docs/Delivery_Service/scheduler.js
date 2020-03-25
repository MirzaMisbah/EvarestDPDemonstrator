class Tmin1 extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);
        this._this = this;
        this.data = [];
        this.dataId = id + Date.now();
        this.fuzzyset = FuzzySet();

    }


    async activate() {
        await this.initialize();
        this.running = true;

    }

    notify(newData) {
    }


    terminate() {
    }

}

class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'GET_OFFERS_READER' + Date.now();
        this.created = true;
        this.data = [];
        this.last_offer = {};

    }



    async activate() {
        await this.initialize();
        this.running = true;



    }

    notify(newData) {
        var obj = newData.getObject();
        if (obj[0] !== "del") {
            if (this.created) {
                this.last_offer = obj
            }
            console.log(Date.now(), JSON.stringify(obj) !== JSON.stringify(this.last_offer));
            if (JSON.stringify(obj) !== JSON.stringify(this.last_offer)) {
                this.last_offer = obj
                this.minionController.notify(this, obj);
            }
            else if (this.created == true) {
                this.created = false;
                this.minionController.notify(this, obj);
            }
        }
    }

    terminate() {
        this.running = false;
    }
}
class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'TestDataReader' + Date.now();
        this.created = false;
        this.store_data = {
            "Android TV SONY KD-55XF9005": "1234 €",
            "Android TV  KD-55XF9005": "1224 €",
            "Smart TV LG  KD-55XF9005": "1834 €",
            "HUAWEI Mate 20 lite": "234 €",
            "HUAWEI mobile Mate 20 lite": "234 €",
            "smart mobile Mate 20 lite": "234 €",
            "MICROSOFT Xbox Wireles": "125 €"
        }

    }

    async activate() {
        await this.initialize();
        this.running = true;

    }

    notify(newData) {
        var cus = newData.getObject().pop();
        console.log("from data " + cus);
        if (cus !== "undefined") {
            this.minionController.notify(this, {
                "store": this.store_data,
                "cust": cus
            });
        }
    }

    terminate() {
        this.running = false;
    }
}
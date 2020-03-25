class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'TestDataReader' + Date.now();
        this.created = false;
        this.store_data = {
            "Arnold Healthfull Wheat Bread": "1,2 €",
            "Di Bruno Bros Flatbread": "1,4 €",
            "Uncle Ben's Corn bread Restaurant Recipe": "1,8 €",
            "Diet Cola 12 Oz Cola": "2,34 €",
            "Ahold Diet Cola Soda -": "2,5 €",
            "Tostitos Crispy Rounds Tortilla Chips": "3,4 €",
            "Lay's Classic Potato Chips": "3,4 €",
            "Bare Fruit Crunchy Apple Chips Fuji Red": "3,4 €",
            "Kettle Potato Chips Backyard Barbeque": "1,25 €"
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
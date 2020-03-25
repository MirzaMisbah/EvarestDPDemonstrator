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
        console.log(newData);
        var store_item = newData.store;
        var cus_data = newData.cust;
        var element;
        var matItem = {};
        if (typeof newData.cust !== 'undefined') {
            for (element in store_item) {
                this.fuzzyset.add(element);
            }
            for (var i = 0; i < cus_data.length - 1; i++) {
                console.log(cus_data[i]);
                matItem[cus_data[i]]="No Match|---";
                if (this.fuzzyset.get(cus_data[i], null, 0.3) != null) {
                    var match = this.fuzzyset.get(cus_data[i], null, 0.3);
                    this.data = [];
                    for (var h = 0; h < match.length; h++) {
                        var str =  match[h][1] + "|" + store_item[match[h][1]] ;
                        this.data.push(str);
                        console.log(str);
                    }
                    console.log(this.data);
                    matItem[cus_data[i]] = this.data
                    
                }

            }
            matItem["id"] = cus_data[cus_data.length - 1]
            console.log(matItem);
            this.minionController.notify(this, matItem);
        }
    }


    terminate() {
    }

}

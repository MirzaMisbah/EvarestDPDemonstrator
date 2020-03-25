class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'Items';
        this.created = false;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.lastCus = "";
        var obj = [];
        var url = ["data/e-store.csv","data/food_store.csv"] 
        for(var i  = 0 ;i<2;i++){
            var csvData = {};
            csvData = this.readSaveData(url[i]);
            obj.push(csvData);
            this.saveList(obj);
        }
       
        

    }
    readSaveData(url) {
        //var url = "data/e-store.csv"
        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);

        var csvData = {};
        var jsonObject = request.responseText.split(/\r?\n|\r/);
        for (var i = 0; i < jsonObject.length; i = i + 1) {
            var item = jsonObject[i].split(",");
            csvData[item[1]] = (item[0]);

        }
        console.log(csvData);
        return csvData;
    }

    saveList(csvData) {
        if (this.created) {
            this.updateData("Items", csvData)
        } else {
           // csvData.then(function(result){
            this.created = true;
            console.log("from data " + csvData + this.created);
            this.saveData("Items", csvData);
            
            //});
        }
    }

    notify(newData) {
        /*
        var url = "data/e-store.csv"
        var cus = newData.getObject().pop();
        console.log("from data " + cus);
        if (cus !== "undefined") {
            var request = new XMLHttpRequest();
            request.open("GET", url, false);
            request.send(null);

            var csvData = {};
            var jsonObject = request.responseText.split(/\r?\n|\r/);
            for (var i = 0; i < jsonObject.length; i = i + 2) {
                var item = jsonObject[i].split(",");
                console.log(item[1] + "      " + item[0])
                csvData[item[1]] = (item[0]);

            }
            csvData["cust"] = cus;
            if (this.created) {
                this.lastCus = cus;
            }
            //console.log(Date.now(), JSON.stringify(obj) !== JSON.stringify(this.last_offer));
            if (cus !== this.lastCus) {
                this.lastCus = cus;
                //console.log(csvData);
                this.minionController.notify(this, csvData);
            }
            else if (this.created == true) {
                this.created = false;
                //console.log(csvData);
                this.minionController.notify(this, csvData);
            }


        }*/
    }

    terminate() {
        this.running = false;
    }
}
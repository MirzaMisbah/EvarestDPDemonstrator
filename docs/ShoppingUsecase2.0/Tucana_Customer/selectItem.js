class selectItem extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];

    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
    }

    async notify(newData) {

        console.log("New Data in selectItem" + JSON.stringify(newData));


        var db = window.indexedDB.open("data");
        var objectStore;
        db.onsuccess = function  (event){
            objectStore = db.result;
            console.log(objectStore);
        }


        var result  = objectStore.get("stores");

        console.log(result);


        //const item = await db.transaction("id").objectStore("id").get("store");

        console.log("Got from indexDB: " + item);
        var storeDiv = document.getElementById("StoreList");
        var itemList = document.getElementById("ItemList");
        console.log(storeDiv);
        var checkItems = new Set([]);

        var storeList = newData;

        for (var l = 0; l < storeList.length; l++) {
            var mdata = {};
            console.log(storeList[l])
            for (var key in storeList[l]) {
                mdata["Name"] = key;
                for (var k in storeList[l]) {
                    var temp = {};
                    temp = storeList[l][k]
                    for (var o in temp) {
                        var temp2 = {};
                        temp2 = temp[o];
                    }
                }
                for (var ke in temp2) {
                    mdata[ke] = temp2[ke];
                }
                //this.saveStoreData(mdata["Name"],mdata);
                Object.keys(mdata).forEach(function (key) {

                    if (key == "Name" && document.getElementById(key) == null) {

                        var h3 = document.createElement('H4');
                        h3.id = mdata[key];
                        h3.innerText = mdata[key];

                        storeDiv.insertBefore(h3, storeDiv.childNodes[0]);

                    } else {
                        var tr = document.createElement("tr");

                        var thName = document.createElement("th");
                        var thPrize = document.createElement("th");
                        var thSelect = document.createElement("th");

                        thName.innerText = key;
                        thPrize.innerText = mdata[key] + "€";

                        var checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.id = key;

                        var label = document.createElement('label');
                        label.htmlFor = key;
                        label.innerText = "";

                        thSelect.appendChild(checkbox);
                        thSelect.appendChild(label);

                        /*checkbox.addEventListener("click",
                            function () {
                                checkItems.add(tr.innerText);
                                console.log(checkItems);
                            });*/
                        //thSelect.appendChild(checkbox);
                        tr.appendChild(thName);
                        tr.appendChild(thPrize);
                        tr.appendChild(thSelect);
                        itemList.appendChild(tr);
                    }
                })

            }

        }

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

}
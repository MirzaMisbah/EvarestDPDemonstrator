class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = "Stores";
        this.created = false;
        this.data = [];
        this.last_offer = {};




    }

    async activate() {
        await this.initialize();

        console.log("Acti go")
        const _this = this;
        this.running = true;
        var tab3 = document.getElementById("tabA").getElementsByTagName("li")[0];
        tab3.onclick = function () {
            var delayInMilliseconds = 100; //1 second
           
             setTimeout(function () {
                var tab = document.getElementById("tabA").getElementsByTagName("div")[0];
                var itm = tab.getElementsByTagName("div")[0];
                var itm1 = itm.getElementsByTagName("div")[0];
                var submitLabel = document.createElement('label');
                submitLabel.innerText = "Get Offers";
                var submitButton = document.createElement("button");
                submitButton.onclick = function read() {
                     _this.readData(_this.dataId).then(function (res) {
                        _this.minionController.notify(_this, res.response.res.object)
                    });
                }
                submitButton.id = "submitButton";
                submitButton.appendChild(submitLabel);
                itm1.appendChild(submitButton);
                var obj =[];
                

                 _this.readData("shopList").then(function (res) {
                    console.log(res.response.res.object);
                    obj = res.response.res.object;
        
                });
            
            setTimeout(function () {
                var lis = document.getElementById("shopList");
               
            for (var i = 0; i < obj.length; i++) {
                var l = document.createElement("li")
                l.className ="list-group-item";
                console.log(l);
                var sp = document.createElement("span");
                var a = document.createElement("a");
                a.className = "close";
                a.href = "#";
                l.append(sp);
                l.append(a);
               
                    sp.innerHTML = obj[i];
                    console.log(sp.innerHTML);
                    lis.append(l);
                    //this.data.push(itm.item(k).innerHTML)
            
                //parent.removeChild(lis[i]);
            
        }
    }, delayInMilliseconds);
    
            

            }, delayInMilliseconds);

        }

        var tab = document.getElementById("tabA").getElementsByTagName("div")[0];
        console.log(tab);
        var itm = tab.getElementsByTagName("div")[0];
        console.log(itm);
        var itm1 = itm.getElementsByTagName("div")[0];
        var submitLabel = document.createElement('label');
        submitLabel.innerText = "Get Offers";
        var submitButton = document.createElement("button");
        submitButton.onclick = function read() {
            _this.readData(_this.dataId).then(function (res) {
                console.log(res.response.res.object);
                _this.minionController.notify(_this, res.response.res.object)
            });
        }
        submitButton.id = "submitButton";
        submitButton.appendChild(submitLabel);
        itm1.appendChild(submitButton);





    }
    saveStoreData(data) {
        if (this.created) {
            this.updateData("match", data)
        } else {
            this.saveData("match", data);
            this.created = true;
        }
    }

    notify(newData) {
        console.log("matched offers  ", newData)

    }

    terminate() {
        this.running = false;
    }
}
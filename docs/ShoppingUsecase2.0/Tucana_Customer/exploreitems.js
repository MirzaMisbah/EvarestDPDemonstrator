class selectItem extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = {};


    }
    async saveStoreData(id, data) {
        const _this = this;

        await _this.readData(id).then(function (res) {
            if (res.response.res != null) {
                _this.data = res.response.res.object;
                console.log(res.response.res.object);
            }


        });
        _this.data["Name"] = id.trim();
        for (var key in data) {
            _this.data[key] = data[key];
            //console.log("SDFFFFFFFFFFFFG                ",key,_this.data);

        }
        this.updateData(id.trim(), _this.data)

    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
    }

    async notify(newData) {
        const myNode = document.getElementById("items");
        const _this = this;
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        for (var i = 0; i < newData.length; i++) {
            var ob = newData[i];
            console.log(ob);
            for (var key in ob) {
                console.log(ob[key], key)
                if (ob[key] != null) {
                    var obj = ob[key]
                    for (var k in obj) {
                        if (k != "Name") {
                            console.log(obj[k], k);
                            var name = document.createElement("h2");
                            name.innerText = key;
                            name.style.textAlign = "center";
                            //myNode.appendChild(name);
                            var match = obj[k];
                            for (var kl in match) {
                                console.log(kl, match[kl]);
                                //var match = items[k];
                                var card = document.createElement("div");
                                card.className = "product";
                                var img = document.createElement("img");
                                if (key.includes("Foodies")) {
                                    img.src = "images/food.jpg";
                                }
                                else {
                                    img.src = "images/elect.jpg";
                                }
                                img.alt = kl;

                                card.appendChild(img);
                                var name1 = document.createElement("h1");
                                name1.innerText = k+" From "+key;
                                card.appendChild(name1);
                                var price = document.createElement("p");
                                price.className = "price";
                                price.innerText = match[kl] + "€";
                                card.appendChild(price);
                                var des = document.createElement("p");
                                des.innerText = kl;
                                card.appendChild(des);
                                var buttonPara = document.createElement("p");
                                var button = document.createElement("button");
                                button.innerText = "Add to Cart";
                                button.id = key + "§" + kl + "§" + match[kl];
                                button.onclick = function () {
                                    var id = this.id;
                                    var res = id.split("§");
                                    var key = res[1];
                                    var item = {};
                                    item[key] = res[2];
                                    _this.saveStoreData(res[0], item);
                                    
                                    var x = document.getElementById(id).parentNode.parentNode;
                                    var display = document.getElementById("items");
                                    display.removeChild(x);

                                }
                                buttonPara.appendChild(button);
                                card.appendChild(buttonPara);
                                var display = document.getElementById("items");
                                display.appendChild(card);




                            }
                        }
                    }
                }
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
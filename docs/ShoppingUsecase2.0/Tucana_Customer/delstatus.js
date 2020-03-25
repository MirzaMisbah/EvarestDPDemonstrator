class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'GET_OFFERS_READER' + Date.now();
        this.created = true;
        this.data = [];
        this.last_offer = [];

    }



    async activate() {
        await this.initialize();
        this.running = true;
        var tab = document.getElementById("tabA").getElementsByTagName("li")[2];
        tab.onclick = function () {
           
            var delayInMilliseconds = 100; //1 second

            setTimeout(function () {
                var tab = document.getElementById("tabA").getElementsByTagName("div")[0];
                
                var itm = tab.getElementsByTagName("div")[0];
                console.log(itm);               
                var statButton = document.createElement("a");
                statButton.id = "statButton";
                statButton.style.position = "absolute";
                statButton.style.left = "60%";
                statButton.style.top = "100px";
                statButton.style.textDecoration = "underline";
                statButton.style.cursor = "pointer";
                statButton.innerText="Delivery Status"
                statButton.className="mdl-navigation__link";
                itm.append(statButton);
            }, delayInMilliseconds);
        }

    }
    createCheckbox(labelContent, id, container) {
        var v = document.createElement("input");
        v.type = "checkbox";
        v.id = id;
        v.name = "item";

        var label = document.createElement('label');
        label.htmlFor = id;
        label.innerText = labelContent;
        container.appendChild(v);
        container.appendChild(label);

    }
    createTextField(id, container, placeholder, labelContent, flag) {
        var keywordsFieldLabel = document.createElement("label");
        keywordsFieldLabel.innerText = "\n" + labelContent;

        var keywordField = document.createElement("input");
        keywordField.type = "text";
        keywordField.id = id;
        keywordField.placeholder = placeholder;
        keywordField.readOnly = flag;

        container.appendChild(keywordsFieldLabel);
        container.appendChild(keywordField);
    }
    createTextAreaField(id, container, placeholder, labelContent) {
        var keywordsFieldLabel = document.createElement("label");
        keywordsFieldLabel.innerText = "\n" + labelContent;

        var keywordField = document.createElement("input");
        keywordField.type = "textarea";
        keywordField.id = id;
        keywordField.placeholder = placeholder;

        container.appendChild(keywordsFieldLabel);
        container.appendChild(keywordField);
    }

    saveDeliveryData(data) {
        if (this.created) {
            this.updateData("DEL", data)
        } else {
            this.saveData("DEL", data);
            this.created = true;
        }
    }
    notify(newData) {
        var tab = document.getElementById("tabA").getElementsByTagName("li")[2];
        
        const _this = this;
        var div = document.getElementById("del");
        var h = document.getElementById("t3");
        h.style.display = "none";
        var form = document.getElementById("form");
        //var form = document.createElement("div");
        //form.innerHTML=form1.innerHTML;
        
        div.appendChild(form);
        form.style.display = "inline-block";
        //this.createTextField("store", form, newData["store"], "Pickup Store", true);
        //document.getElementById("store").value = newData["store"];

        for (var key in newData) {
            if (key != "Name") {
                var des = key + "   From Store: " + newData["Name"];
                this.createCheckbox(des, key, form);
            }
        }
        this.createTextAreaField("addr", form, "Enter Address", "Drop-off Address");
        var statLabel = document.createElement('label');
        statLabel.innerText = "Status Update";



        var submitLabel = document.createElement('label');
        submitLabel.innerText = "Get Delivery 2,00€";
        var submitButton = document.createElement("button");
        submitButton.id = "submitButton";
        submitButton.className = "submit-button";
        submitButton.appendChild(submitLabel);

        var buttonDiv = document.createElement("div");
        buttonDiv.className = "clearfix";

        buttonDiv.appendChild(submitButton);
        form.appendChild(buttonDiv);
        submitButton.onclick = function () {
            var obj = {};
            obj["del-method"] = document.getElementById("method").value;

            if (obj["del-method"] != "1" && obj["del-method"] != "2") {
                alert("Select a delivery method", obj["del-method"])
            }
            obj["store"] = newData["Name"];
            obj["date"] = document.getElementById("date").value;
            // obj["time"] = $('*[name=date]').datepicker("getTime");

            var i = 1;
            var item = [];
            var checkboxes = document.getElementsByName("item");

            // loop over them all
            for (var i = 0; i < checkboxes.length; i++) {
                // And stick the checked ones onto an array...
                if (checkboxes[i].checked) {
                    item.push(checkboxes[i].id);
                }
            }
            obj["items"] = item;
            
            obj["address"] = document.getElementById("addr").value;
            var count = 5;
            for (var key in obj) {
                if (obj[key] == null) {
                    alert("Enter the value for " + key + " field")

                }
                else {
                    count--;
                    
                }

            }
            if (count == 0) {
               
                var data;
                _this.readData("DEL").then(function (res) {
                    if(res.response.res != null){
                    _this.data = res.response.res.object;                    
                    console.log(res.response.res.object);                    
                    }
                    
                    
                });
                _this.data.push(obj);
                console.log(_this.data);
                _this.saveDeliveryData(_this.data);
                var snackbarContainer = document.querySelector('#tucana-snackbar');
                var data = {
                    message: "Item(s) sent for Delivery Check Status on the go!",
                    timeout: 5000
                };
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
                h.style.display = "inline-block";
                form.style.display = "none";
                for (var i = 0; i < checkboxes.length; i++) {
                    // And stick the checked ones onto an array...
                    
                        form.removeChild(form.lastChild);
                        form.removeChild(form.lastChild);
                    
                }
               
                form.removeChild(form.lastChild);
                form.removeChild(form.lastChild);
                form.removeChild(form.lastChild);

                document.body.append(form);

                _this.minionController.notify(_this, obj);
            }





        }

    }

    terminate() {
        this.running = false;
    }
}
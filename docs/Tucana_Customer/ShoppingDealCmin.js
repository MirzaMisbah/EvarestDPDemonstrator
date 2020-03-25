class ShoppingDealCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.uiAdapter.addCardImage(this.instanceId, "images/image.png")
        this.uiAdapter.showIframe(this.instanceId, "offers.html");
        this.uiAdapter.requestInput(this.instanceId, "binary", "Offers", this.setActive.bind(this));
        var _this = this;
        this.uiAdapter.requestInput(this.instanceId, "action", "Offers", function () {
            _this.uiAdapter.addData(_this.instanceId, true);
            _this.uiAdapter.sendNotification(_this.instanceId, "New deal");
        });
        


    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    setActive(active) {
        this.active = active;
    }
    tableCreate(data) {

        const _this = this;
        var iframe = document.getElementsByTagName("iframe")[1];
        var tbl = iframe.contentWindow.document.getElementById('tab');
        var tr = tbl.insertRow(-1);

        var td1 = tr.insertCell();
        var _text = document.createTextNode(data["id"]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td1.appendChild(_pre);
        var btn = document.createElement('input');
        btn.type = "button";
        btn.className = "Del-but";
        btn.value = "Get Delivery for 1€";
        btn.onclick = (function () { 
            console.log(data["id"],Object.keys(data))
            var newData ={
                "item" :Object.keys(data),
                "loc":data["id"],
                "user":_this.dataAccessService.getLocalID()
            }
            console.log(newData);
            _this.minionController.notify(_this,newData);
         });
        td1.rowSpan = Object.keys(data).length+1;
        td1.appendChild(btn);
        for (var item in data) {
            if (item === "id")
                continue;

            var td = tr.insertCell();
            var _text = document.createTextNode(item);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);
           
            

            var colData = data[item];
            console.log("cols  ",colData);
            if (Array.isArray(colData)) {
                td.rowSpan = colData.length;


                for (var j = 0; j < colData.length; j = j + 1) {
                    console.log(colData[j]);
                    if(colData[j].includes("SONY")){
                        colData[j]="Not Preferred|---"
                    }

                    var td = tr.insertCell();
                    var d = colData[j].split("|");
                    var _text = document.createTextNode(d[0] + '\t');
                    var _pre = document.createElement("pre");
                    _pre.appendChild(_text);
                    td.appendChild(_pre);

                    var tda = tr.insertCell();
                    var _text = document.createTextNode(d[1] + '\n');
                    var _pre = document.createElement("pre");
                    _pre.appendChild(_text);
                    tda.appendChild(_pre);
                    var tr = tbl.insertRow();
                }

            }
            else {
                var td = tr.insertCell();
                var d = colData.split("|");
                var _text = document.createTextNode(d[0] + '\t');
                var _pre = document.createElement("pre");
                _pre.appendChild(_text);
                td.appendChild(_pre);

                var tda = tr.insertCell();
                var _text = document.createTextNode(d[1] + '\n');
                var _pre = document.createElement("pre");
                _pre.appendChild(_text);
                tda.appendChild(_pre);
                var tr = tbl.insertRow();
            }

        }

    }

    notify(newData) {

        if (newData !== 'undefined') {
            console.log("show deal " + JSON.stringify(newData));
            this.tableCreate(newData);
        }


    }
}
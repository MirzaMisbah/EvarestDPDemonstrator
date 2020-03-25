class ShoppingDealCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.uiAdapter.addCardImage(this.instanceId, "images/new_wishes.png")
        this.uiAdapter.showIframe(this.instanceId, "offer.html");
        this.uiAdapter.requestInput(this.instanceId, "binary", "Shared deals", this.setActive.bind(this));
        var _this = this;
        this.uiAdapter.requestInput(this.instanceId, "action", "Show requests!", function () {
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
        var iframe = document.getElementsByTagName("iframe")[0];
        var tbl = iframe.contentWindow.document.getElementById('tab');
        var tr = tbl.insertRow(-1);

        var td = tr.insertCell();
        var _text = document.createTextNode(data["id"]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td.appendChild(_pre);
        td.rowSpan = Object.keys(data).length+1;
        for (var item in data) {
            if (item === "id")
                continue;

            var td = tr.insertCell();
            var _text = document.createTextNode(item);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);

            var colData = data[item];
            if(Array.isArray(colData)){
            td.rowSpan = colData.length;

            for (var j = 0; j < colData.length; j = j + 1) {

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
            else{
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
        console.log(newData);
        this.tableCreate(newData);

    }
}
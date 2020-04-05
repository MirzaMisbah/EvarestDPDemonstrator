class ShoppingDealCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }

    async activate() {
        await this.initialize();
        this.running = true;
        //this.active = true;
        console.log(this.instanceId);
        this.uiAdapter.addCardImage(this.instanceId, "images/supermarkt.jpg")
        this.uiAdapter.showIframe(this.instanceId, "offers.html");
        this.uiAdapter.requestInput(this.instanceId, "binary", "Orders", this.setActive.bind(this));
        var _this = this;
        this.uiAdapter.requestInput(this.instanceId, "action", "Orders", function () {
            //_this.uiAdapter.addData(_this.instanceId, true);
            //_this.uiAdapter.sendNotification(_this.instanceId, "New deal");
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
        
        var countdown = [1 / 3, 7, 6, 6, 7, 25, 5, 6, 6, 7, 25]
        var iframe = document.getElementsByTagName("iframe")[0];
        var tbl = iframe.contentWindow.document.getElementById('tab');
        var tr = tbl.insertRow();

        var td1 = tr.insertCell();
        var _text = document.createTextNode(data["loc"]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td1.appendChild(_pre);
        td1.rowSpan = Object.keys(data).length + 1;
        var td1 = tr.insertCell();
        var _text = document.createTextNode(data["user"].slice(data["user"].length - 5, data["user"].length));
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td1.appendChild(_pre);

        td1.rowSpan = Object.keys(data).length + 1;
        var listItem = data["item"];
        var j = 0;
        for (var i = 0; i < data["item"].length; i++) {
            if (listItem[i] === "id")
                continue;

            var td = tr.insertCell();
            var _text = document.createTextNode(listItem[i]);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);
            var fiveMinutes = 60 * countdown[j];
            j++;

            console.log(j, "  ", fiveMinutes);
            var td = tr.insertCell();
            var _text = document.createTextNode(countdown[i]);
            var dat = ["del", listItem[i], "On Way", data["user"]]
            this.minionController.notify(this, dat);
            this.startTimer(fiveMinutes, _text, tr.rowIndex, td.cellIndex, listItem[i], data["user"]);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);

            var td = tr.insertCell();
            var _text = document.createTextNode("On Way");
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);


            var tr = tbl.insertRow(-1);


        }

    }

    startTimer(duration, display, row, cell, item, id) {
        var timer = duration, minutes, seconds;
        const _this = this;
        var iframe = document.getElementsByTagName("iframe")[0];
        var tbl = iframe.contentWindow.document.getElementById('tab');
        console.log(row, cell, tbl.id)
        var t = setInterval(function () {
            var data = ["del", item, "DELIVERED", id];
            minutes = parseInt(timer / 60, 10)

            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(t);
                tbl.rows[row].cells[cell + 1].innerHTML = 'Delivered';
                _this.minionController.notify(_this, data)

            }
        }, 1000);
    }

    notify(newData) {
        if (newData !== 'undefined') {
            console.log("new Del " + JSON.stringify(newData));
            this.tableCreate(newData);

        }


    }
}
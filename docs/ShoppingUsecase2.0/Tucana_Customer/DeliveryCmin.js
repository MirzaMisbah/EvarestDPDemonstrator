class ShoppingDealCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;



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
    updateStat(data) {
        var iframe = document.getElementsByTagName("iframe")[0];
        var tbl = iframe.contentWindow.document.getElementById('tab');
        var tr = tbl.insertRow(-1);

        var td = tr.insertCell();
        var _text = document.createTextNode(data[0]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td.appendChild(_pre);
        var td = tr.insertCell();
        var now = new Date();
        var date = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear() + "  " + now.getHours() + ":" + now.getMinutes() + ":" +
            now.getSeconds();
        var _text = document.createTextNode(date);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td.appendChild(_pre);
        var td = tr.insertCell();
        var _text = document.createTextNode(data[1]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td.appendChild(_pre);
        var td = tr.insertCell();
        var _text = document.createTextNode(data[2]);
        var _pre = document.createElement("pre");
        _pre.appendChild(_text);
        td.appendChild(_pre);


    }

    notify(newData) {

        if (newData !== 'undefined') {
            console.log("show deal " + JSON.stringify(newData));
            this.uiAdapter.addData(this.instanceId, true);
            this.uiAdapter.sendNotification(this.instanceId, "Delivery Status");
            //this.updateStat(newData);
        }


    }
}
class SaveTab extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }



    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.count = 0;
        const _this = this;
         /**
        var tab1 = document.getElementById("tabA").getElementsByTagName("li")[0];
        var tab2 = document.getElementById("tabA").getElementsByTagName("li")[1];
        var tab3 = document.getElementById("tabA").getElementsByTagName("li")[2];
        tab1.onclick = function () {
            var delayInMilliseconds = 100; //1 second
            alert("tab1 save");
            setTimeout(function () {
                var tab = document.getElementById("tabA").getElementsByTagName("div")[0];
                console.log(tab);
                var itm = tab.getElementsByTagName("div")[0];
                console.log(itm);
                var itm1 = itm.getElementsByTagName("div")[0];
                var submitLabel = document.createElement('label');
                submitLabel.innerText = "Get Offers";
                var submitButton = document.createElement("button");

                submitButton.id = "submitButton";
                submitButton.appendChild(submitLabel);
                itm1.appendChild(submitButton);
            }, delayInMilliseconds);
        }

        tab2.onclick = function () {
            _this.minionController.notify(_this, "2");
        }
        tab3.onclick = function () {
            _this.minionController.notify(_this, "3");
        }
 */
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }


    notify(newData) {



    }
}
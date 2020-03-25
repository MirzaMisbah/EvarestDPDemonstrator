class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'TestDataReader' + Date.now();
        this.created = false;
       
        this.created = false;
        this.data = [];

    }

    savelist(){          
        if (this.created) {
            this.updateData(this.dataId, this.data)
        } else {
            this.saveData(this.dataId, this.data);
            this.created = true;
        }
    }


    createList() {
        const _this = this;
        
        var b = document.getElementById("add");
        b.onclick = function () {
            var t = document.getElementById("t");
            var f = document.getElementById("f");

            f.value = f.value + t.value + ", ";
            t.value = "";
        }

        var btn = document.getElementById("send");
        btn.onclick = function () {
            _this.data=[];
            var f = document.getElementById("f");
            var data = f.value;
            //var data ="android tv,HUAWEI mobile";
            data = data.split(",");
            for (var i = 0; i < data.length-1; i++) {
                console.log(data[i]);
                _this.data.push(data[i]);
            }
            f.value = "";
            //_this.savelist();
            console.log("get customer data"+_this.data);
            _this.minionController.notify(_this, _this.data);
        }
    }


    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        var div = document.createElement("div");
        const _this = this;
        div.className = "mdl-card selection-card mdl-cell mdl-cell--top mdl-cell--6-col";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                div.innerHTML = xmlhttp.responseText;
                _this.createList();
            }
        };
        xmlhttp.open("GET", "list_input.html", true);
        xmlhttp.send();
        var body = document.body.querySelector(".mdl-grid");
        body.appendChild(div);
        
        this.running = true;
      


    }

    notify(newData) {
        // console.log(newData);
        //this.minionController.notify(this, newData.getObject().pop());
    }

    terminate() {
        this.running = false;
    }
}
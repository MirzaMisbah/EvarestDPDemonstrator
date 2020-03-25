class InstoreItems extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
        this.created = false;

    }
    saveStoreData(id,data) {
        if (this.created) {
            this.updateData(id, data)
        } else {
            this.saveData(id, data);
            this.created = true;
        }
    }
    createCheckbox(labelContent, id, container) {
        var v = document.createElement("input");
        v.type = "checkbox";
        v.id = id;

        var label = document.createElement('label');
        label.htmlFor = id;
        label.innerText = labelContent;
        container.appendChild(v);
        container.appendChild(label);

    }
    atStore(obj, iframe) {
        const _this = this;
        var iframe = document.getElementById('offers');
        var tbl = iframe.contentWindow.document.getElementById('tab');
        var old_tbody = tbl.getElementsByTagName("tbody")[0];
        var new_tbody = document.createElement('tbody');
        old_tbody.parentNode.removeChild(old_tbody);
        new_tbody.setAttribute("role","rowgroup");
        tbl.appendChild(new_tbody);
        var h1 = iframe.contentWindow.document.getElementById("hi1");

        for (var key in obj) {
            if (key == "Name") {
                h1.innerText = obj[key]
            }
            else {
                var tr = new_tbody.insertRow(-1);
                tr.setAttribute("role","row");
                var td1 = tr.insertCell();
                td1.setAttribute("role","cell");

                var _text = document.createTextNode(key);
                var _pre = document.createElement("pre");
                _pre.appendChild(_text);
                td1.appendChild(_pre);
                var td1 = tr.insertCell();
                td1.setAttribute("role","cell");
                var _text = document.createTextNode(obj[key]);
                var _pre = document.createElement("pre");
                _pre.appendChild(_text);
                td1.appendChild(_pre);
                var td1 = tr.insertCell();
                td1.setAttribute("role","cell");
                this.createCheckbox("", key, td1);
            }
        }
        var total = 0;
        var grid = iframe.contentWindow.document.getElementById("tab");
        var checkBoxes = grid.getElementsByTagName("INPUT");
        for (var i = 0, len = checkBoxes.length; i < len; i++) {
            if (checkBoxes[i].type === 'checkbox') {
                checkBoxes[i].onclick = function () {
                    var total = 0;
                    for (var i = 0; i < checkBoxes.length; i++) {
                        if (checkBoxes[i].checked) {
                            var row = checkBoxes[i].parentNode.parentNode;
                            total = total + parseFloat(row.cells[1].getElementsByTagName('pre')[0].innerHTML);
                        }
                        
                    }
                    if (total != 0) {
                        iframe.contentWindow.document.getElementById("Buynow").innerText = total + " € Buy now"
                    }
                }
            }
        }

        iframe.contentWindow.document.getElementById("Buynow").onclick =
            function write() {
                var data = [];
                var storeData = [];
                var grid = iframe.contentWindow.document.getElementById("tab");
                var checkBoxes = grid.getElementsByTagName("INPUT");

                for (var i = 0; i < checkBoxes.length; i++) {
                    if (checkBoxes[i].checked) {
                        var row = checkBoxes[i].parentNode.parentNode;
                        console.log(parseFloat(row.cells[1].getElementsByTagName('pre')[0].innerHTML));
                        data["Name"] = obj["Name"];
                        data[row.cells[0].getElementsByTagName('pre')[0].innerHTML] = row.cells[1].getElementsByTagName('pre')[0].innerHTML;
                        total = total + parseFloat(row.cells[1].getElementsByTagName('pre')[0].innerHTML);
                    }
                    else {
                        var row = checkBoxes[i].parentNode.parentNode;
                        console.log(parseFloat(row.cells[1].getElementsByTagName('pre')[0].innerHTML));
                        storeData["Name"] = obj["Name"];
                        storeData[row.cells[0].getElementsByTagName('pre')[0].innerHTML] = row.cells[1].getElementsByTagName('pre')[0].innerHTML;
                    }
                }
                if (total == 0) {
                    alert("Select items to purchase first")
                }
                else {
                    _this.saveStoreData("bought",data);
                    _this.saveStoreData(storeData["Name"],storeData);
                    //alert(total);
                    var tab = document.getElementById("tabA").getElementsByTagName("li")[2];
                    tab.click();
                    document.getElementById("dia").close();
                    _this.minionController.notify(_this, data)
                }
            };

    }


    async activate() {
        console.log("instore");
        await this.initialize();
        console.log("instore");
        this.running = true;
        this.active = true;
        const _this = this;
        var count = 0;
        

        var obj;
        document.getElementById("instore").addEventListener("click",
            function read() {
                var divTag = document.getElementById("div1");    
                 var id = divTag.innerText ;
                 var iframe = document.createElement("iframe");
                    iframe.id = "offers";
                    iframe.src = "offers.html";
                _this.readData(id).then(function (res) {
                    obj = res.response.res.object;
                    console.log(res.response.res.object);
                    _this.atStore(obj, iframe);


                });
                //alert(outputData.innerText);
                if (count == 0) {
                    count = 1;
                    var popupdiv = document.createElement("dialog");
                    popupdiv.id = "dia"
                    popupdiv.className = "mdl-dialog";
                    
                    //popupdiv.innerText=outputData.innerText

                    var close = document.createElement("button");
                    close.style.position = "absolute";
                    close.style.top = 0;
                    close.style.left = 0;
                    close.id = "close"
                    close.className = "mdl-button mdl-button--icon red-button";
                    close.innerHTML = "<i class='material-icons'>close</i>";
                    close.onclick = function () {
                        popupdiv.close();

                    }
                    popupdiv.append(close);
                    popupdiv.appendChild(iframe);
                    document.body.appendChild(popupdiv);

                }
                document.getElementById("dia").showModal();
            });

    }

    notify(newData) {

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

}
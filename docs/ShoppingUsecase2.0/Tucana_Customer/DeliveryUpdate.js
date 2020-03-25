class DeliveryUpdate extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }

    getstatdiv(statButton) {
        const _this = this;

        var iframe = document.getElementById("stat");


        _this.readData("DEL").then(function (res) {
            console.log(res);
            var obj = res.response.res.object;
            if (obj == null || obj.length == 0) {
                var snackbarContainer = document.querySelector('#tucana-snackbar');
                var data = {
                    message: "Delivers item list is empty",
                    timeout: 4000
                };
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
                return;
            }
            _this.updateStat(obj, iframe);

        });
        if (this.count == 0) {
            this.count = 1;
            var popupdiv = document.createElement("dialog");
            popupdiv.id = "stat-dia"
            popupdiv.className = "mdl-dialog";

            iframe.style.display = ""
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
        document.getElementById("stat-dia").showModal();



    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.count = 0;
        const _this = this;

        var tab3 = document.getElementById("tabA").getElementsByTagName("li")[2];
        tab3.onclick=function(){
        var delayInMilliseconds = 100; //1 second

        setTimeout(function () {
            var tab = tab3.getElementsByTagName("div")[0];
            var itm = tab.getElementsByTagName("div")[0];
            var statButton = itm.getElementsByTagName("a")[0];

            statButton.onclick = function () {

                _this.getstatdiv(statButton);
            }
        }, delayInMilliseconds);
    }






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
    updateClock(clock, endtime,td) {

        console.log(clock);
        //var clock = document.getElementById(id);
        var daysSpan = clock.querySelector('.days');
        var hoursSpan = clock.querySelector('.hours');
        var minutesSpan = clock.querySelector('.minutes');
        //var secondsSpan = clock.querySelector('.seconds');
        var d = new Date();
        var date = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();

        var hours = d.getHours();
        var mins = d.getMinutes();
        var e = month + "-" + date + "-" + year + " " + hours + ":" + mins;
        
        var t = Date.parse(endtime) - Date.parse(e);
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        var t = {};
        t['total'] = t;
        t['days'] = days;
        t['hours'] = hours;
        t['minutes'] = minutes;
        t['seconds'] = seconds;
        daysSpan.innerHTML = t.days;
        hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);


        for (let i = 0; i < 50; i++) {
            setTimeout(function timer() {  
                var d = new Date();
                var date = d.getDate();
                var month = d.getMonth() + 1;
                var year = d.getFullYear();

                var hours = d.getHours();
                var mins = d.getMinutes();
                var e = month + "-" + date + "-" + year + " " + hours + ":" + mins;
                
                var tr = Date.parse(endtime) - Date.parse(e);
                var seconds = Math.floor((tr / 1000) % 60);
                var minutes = Math.floor((tr / 1000 / 60) % 60);
                var hours = Math.floor((tr / (1000 * 60 * 60)) % 24);
                var days = Math.floor(tr / (1000 * 60 * 60 * 24));
                var t = {};
                t['total'] = tr;
                t['days'] = days;
                t['hours'] = hours;
                t['minutes'] = minutes;
                daysSpan.innerHTML = t.days;
                hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
                minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
                if(t.total<= 0){
                    daysSpan.innerHTML =0;
                    hoursSpan.innerHTML = 0;
                    minutesSpan.innerHTML = 0;                    
                    i=50;
                    clearInterval(timer);
                    return;
                }



            }, i * 6000);
        }


        //secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);



    }


    updateStat(obj, iframe) {
        iframe = document.getElementById("stat");
        var tbl = iframe.getElementsByTagName("table")[0];
        var old_tbody = tbl.getElementsByTagName("tbody")[0];
        var new_tbody = document.createElement('tbody');
        new_tbody.setAttribute("role","rowgroup");
        old_tbody.parentNode.removeChild(old_tbody);
        tbl.appendChild(new_tbody);


        for (var k = 0; k < obj.length; k++) {
            var data = obj[k];
            var tr = new_tbody.insertRow(-1);
            tr.setAttribute("role","row");

            var td = tr.insertCell();
            td.setAttribute("role","cell");
            var t = "";
            for (var i = 0; i < data["items"].length; i++) {
                t = t + data["items"][i] + "\u000a";
            }
            var _text = document.createTextNode(t);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);

            var td = tr.insertCell();
            td.setAttribute("role","cell");
            var _text = document.createTextNode(data["store"]);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);
            var td = tr.insertCell();
            var _text = document.createTextNode(data["address"]);
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);
            var td = tr.insertCell();
            td.setAttribute("role","cell");

            var timediv = document.createElement("div");
            timediv.id = data["items"][0];
            timediv.style = "text-align:center";
            timediv.style.display = "none";
            timediv.className = "abc";

            var div1 = document.createElement("div");
            var span1 = document.createElement("span");
            var sdiv1 = document.createElement("div");
            span1.className = "days";
            sdiv1.className = "smalltext";
            sdiv1.innerText = "Days";
            div1.appendChild(span1);
            div1.appendChild(sdiv1);

            var div2 = document.createElement("div");
            var span2 = document.createElement("span");
            var sdiv2 = document.createElement("div");
            span2.className = "hours";
            sdiv2.className = "smalltext";
            sdiv2.innerText = "Hours";
            div2.appendChild(span2);
            div2.appendChild(sdiv2);

            var div3 = document.createElement("div");
            var span3 = document.createElement("span");
            var sdiv3 = document.createElement("div");
            span3.className = "minutes";
            sdiv3.className = "smalltext";
            sdiv3.innerText = "Minutes";
            div3.appendChild(span3);
            div3.appendChild(sdiv3);
            timediv.appendChild(div1);
            timediv.appendChild(div2);
            timediv.appendChild(div3);
            console.log(timediv);
            this.updateClock(timediv, data["date"],td);
            timediv.style.display = "";

            td.appendChild(timediv);



            var td = tr.insertCell();
            td.setAttribute("role","cell");
            var d = new Date();
                var date = d.getDate();
                var month = d.getMonth() + 1;
                var year = d.getFullYear();

                var hours = d.getHours();
                var mins = d.getMinutes();
                var e = month + "-" + date + "-" + year + " " + hours + ":" + mins;
                console.log(Date.parse(data["date"]), Date.parse(e));
                var tr = Date.parse(data["date"]) - Date.parse(e);
                if(tr<= 0){
                    var _text = document.createTextNode("Delivered");
                }
                else{
            var _text = document.createTextNode("On Way");
                }
            var _pre = document.createElement("pre");
            _pre.appendChild(_text);
            td.appendChild(_pre);


        }

    }

    notify(newData) {
        const _this = this;
        var div = document.getElementById("del1");
        var statButton = div.getElementsByTagName("a")[0];

        statButton.onclick = function () {
            _this.getstatdiv(statButton);
        }

    }
}
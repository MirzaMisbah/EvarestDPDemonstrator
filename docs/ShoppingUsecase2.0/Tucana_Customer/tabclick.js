class TabClick extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
    }

  

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.count = 0;        

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }
   

    notify(newData) {  
        if(newData == "1"){
            var obj = [];
            this.readData("shopList").then(function (res) {
                console.log(res.response.res.object);
                obj = res.response.res.object;
    
            });
            
            var lis = document.getElementById("shopList").getElementsByTagName("li");
            console.log(lis);
        for (var i = 0; i < obj.length; i++) {
            var itm = lis[i].getElementsByTagName("span");
            console.log(itm);
            for (var k = 0; k < itm.length; k++) {
                console.log(itm.item(k).innerHTML);
                //this.data.push(itm.item(k).innerHTML)
            }
            //parent.removeChild(lis[i]);
        
    }

        } 



    }
}
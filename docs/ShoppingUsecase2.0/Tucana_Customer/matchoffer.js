class Tmin1 extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);
        this._this = this;
        this.data = [];
        this.created = false;
        this.dataId = id + Date.now();
        this.fuzzyset = FuzzySet();

    }


    async activate() {
        await this.initialize();
        this.running = true;

    }
    saveStoreData(id,data) {
        if (this.created) {
            this.updateData(id, data)
        } else {
            this.saveData(id, data);
            this.created = true;
        }
    }

    notify(objs) {
        var storeList=[];
        this.data = [];
        
        var lis = document.getElementById("shopList").getElementsByTagName("li");
        for (var i = 0; i < lis.length; i++) {
            var itm = lis[i].getElementsByTagName("span");
            for (var k = 0; k < itm.length; k++) {
                itm.item(k).innerHTML;
                this.data.push(itm.item(k).innerHTML)
            }
            //parent.removeChild(lis[i]);
        }
        this.saveStoreData("shopList",this.data);
        //tab.click();
       
        
        var finalData = {};
        for(var k = 0 ; k < objs.length;k++){
            var newData = objs[k]; 
            this.fuzzyset = FuzzySet();          
            var matchData1 = {};
            var matchData2 = {};

        for (var element in newData) {
            this.fuzzyset.add(element);

        }

        for (var i = 0; i < this.data.length; i++) {
            var matchData = {};
            var match = this.fuzzyset.get(this.data[i], null, 0.3);            
            if (match != null) {
                for (var h = 0; h < match.length; h++) {
                    matchData[match[h][1]] = newData[match[h][1]]
                }
                matchData2[this.data[i]] = matchData;
            }
            
        }
        if (this.fuzzyset.get("Name", null, 0.9)) {
            var name = this.fuzzyset.get("Name", null, 0.9);            
            matchData1[newData[name[0][1]]] = matchData2;
        }
        if(matchData2 != null){
        storeList.push(matchData1);
        }
        console.log(storeList);

    }

       

        for(var l = 0 ; l < storeList.length;l++){
            var mdata = {};
            //console.log(storeList[l])
            for(var key in storeList[l]){
                mdata["Name"] = key.trim();
                //console.log(mdata["Name"] ,key.trim(),storeList[l])
                for(var k in storeList[l]){
                    var temp ={};
                    //temp = storeList[l][k] 
                    //console.log(k,l,temp , storeList[l][k] )
                    if(storeList[l][k] != null){
                        temp["Name"]=k.trim();
                        this.saveStoreData(k.trim(),temp);
                    }
                
                }
                
                
               
        
            }
            
        }
        window.addEventListener('mapLoaded',function (e) {
            console.log("Event mapLoaded successfully listend");


        })
        
        





        if (storeList != null) {
            this.saveStoreData("match",storeList);
            this.minionController.notify(this, storeList);
        }
    }



    terminate() {
    }

}

class swComponent extends tucana.minion.Pmin {
 
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
        this.model = tucana.model;
        this.dataId = id + Date.now();
        this.data = [];
        console.log('I am in a Service')
    }

    async activate() {
        const _this = this;
        _this.initialize();
        this.running = true;
        if(localStorage.getItem("producer")  == "true"){
            _this.calculation();
        }
    }
    calculation(result){
        const _this = this;
        var SAS =  {
            id: _this.result["id"],
            version: _this.result["version"],
            name: _this.result["name"],
            descriptionText: _this.result["descriptionText"],
            data: [{
                "Num1": "X"},{
                "Num2": "X"},{
                "Res": parseInt((dummy[0]['Num1'])) + parseInt((dummy[1]['Num2']))
            }],
            context: _this.result["context"]
        };
        
    }
    checkSAS(){
        
        const _this = this;
        (function myLoop (i) { 
            const __this = _this;       
            setTimeout(function () { 
                if (localStorage.getItem("Connected peer")){ 
                    var answer = window.confirm('SAS has been send to you. You want to download it.');
                    if (answer){
                        __this.createSAS();
                        alert('SAS downloaded');
                    }                                                        
                }
                else{
                    alert('You didnt received any SAS yet.');
                }                   
               if ((20000)) myLoop(--i);
            }, 70000)  
         })(10000);


    }
    useSAS(){
        const _this = this;
        //JSONObject js = new JSONObject();
        var dummy = _this.result["data"];
        
        this.calculation();
        console.log(SAS)
        console.log(_this.result)
        _this.downloadObjectAsJson(SAS, 'SAS');
    } 

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this. data = [];
    }

    notify(newData) {
        this.result = newData;  
        console.log(this.ids);  
        this.data.push(newData);
            
    }
}
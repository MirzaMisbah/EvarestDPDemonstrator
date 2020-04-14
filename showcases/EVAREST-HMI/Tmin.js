class Tmin extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);
        this._this = this;
        this.data = [];
        this.dataId = id + Date.now();
        console.log('I am in Tmin')
    }


    async activate() {
        await this.initialize();
        this.running = true;
        const _this = this;
        this.TrequestContract();

        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));

    }
    TrequestContract() {
        var d = new Date();
        //check = setScReqValue();
        var answer = window.confirm('Your are about to request Sindo for SAS. Do you really want to do this?');
        if (answer){
            showalert('Your request has been send to sindo!');
                //StartService()
                refreshIndex();
                setTimeout(function () {
                    if (!checkConnectedPeer()){ 
                        showalert('There is some network issue please try again after some time!');
                        checkResponse();
                    }
                    else {
                        openlink("main02.html")
                    }
                }, 20000)
                
            }
    }
    TuploadData() {
        var d = new Date();
        //check = setScReqValue();
        alert('Your are about to upload your data.');
        if (true){

            localStorage.removeItem("Connected peer");
            if(localStorage.getItem("producer")  == "true"){
            const reader = this.JSONReader((result) => {
                console.log(result)
                
            });
            console.log(reader);
            //refreshIndex();
            //doAsync();
            setTimeout(function () {
                //if(!this.ids == 'USER_NA'){
                    this.checkSAS();
                //}
                },10000);
        }
        //StartService()                 
                    /*setTimeout(function () {
                        
                        refreshIndex();
                        showalert('We are redirecting you to visualization'); 
                        setTimeout(function () {
                            openlink('mainL.html')
                        }, 20000)
                        

                    }, 20000)*/
                }
                showalert('Your data has been uploaded. We are aggregating your data according to provided SAS by sindo');
            }

    notify(newData) {
        const _this = this;
        _this.result = newData;
        console.log('data in Tmin');
        console.log(newData);


    }


    terminate() {
    }

}

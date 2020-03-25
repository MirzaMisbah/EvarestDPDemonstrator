class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'GET_OFFERS_READER' + Date.now();
        this.created = true;
        this.data = [];
        this.last_offer = [];

    }



    async activate() {
        await this.initialize();
        this.running = true;



    }

    notify(newData) {
        var obj = newData.getObject();
        console.log("stat ",obj);
        if (obj[0] === "del") {  
            if (this.created) {
                this.last_offer = obj
                                
                this.minionController.notify(this, obj);
                this.created = false;
            }             
            else if (obj[1] == this.last_offer[1] && obj[2] != this.last_offer[2])  {
                this.created = false;
                this.last_offer = obj
                this.minionController.notify(this, obj);
            }  
            console.log("LASR ",this.last_offer);      
            
        }
    }

    terminate() {
        this.running = false;
    }
}
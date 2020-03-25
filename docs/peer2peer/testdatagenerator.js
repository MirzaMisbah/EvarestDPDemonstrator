class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies=[]) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];
        this.dataId = 'TestDataGenerator' + Date.now();
        this.created = false;
        
    }

    async activate() {
        await this.initialize();
        this.running = true;
        
        this.loop = setInterval(() => {
            let randomNumber1 = Math.floor(Math.random() * Math.floor(100));
            let randomNumber2 = Math.floor(Math.random() * Math.floor(100));
            let result = {
                timestamp : Date.now(),
                value : [randomNumber1, randomNumber2]
            };
            this.data.push(result);
            
            this.minionController.notify(this, result);
        }, 18000);
    
    }

    notify(newData) {
        return null;
    }

    terminate() {
        clearInterval(this.loop);
        this.running = false;
    }
}
class ShoppingDealCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        this.uiAdapter.addCardImage(this.instanceId,"images/wishes.png")
        this.uiAdapter.showIframe(this.instanceId,"https://www.edeka.de/homepage.jsp");
        this.uiAdapter.requestInput(this.instanceId, "binary", "Show deals", this.setActive.bind(this));
        var _this = this;
        this.uiAdapter.requestInput(this.instanceId, "action", "Show me a deal!", function(){
            _this.uiAdapter.addData(_this.instanceId, true);
            _this.uiAdapter.sendNotification(_this.instanceId, "New deal");    
        });
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    setActive(active){
        this.active = active;
    }
    notify(newData) {
        if(this.running && this.active && !newData.value[0]) {
            this.uiAdapter.addData(this.instanceId, true);
            if(!newData.value[0]) {
                this.uiAdapter.sendNotification(this.instanceId, "New deal");
            }
        }
    }
}
class TestIntegerVisualizer extends tucana.minion.VisualizationCmin {

    constructor(dataAccessService, minionController, id, uiAdapter, dependencies=[]) {
        super(dataAccessService,minionController,id,uiAdapter,dependencies);
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.uiAdapter.showBarChart(this.instanceId,["My number"],{});
        
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    notify(newData) {
        if(this.running) {
            var data = {index : 0, value : newData.value};
            this.uiAdapter.addData(this.instanceId, data);
        }
    }
}
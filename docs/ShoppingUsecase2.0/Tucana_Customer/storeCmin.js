class storeCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.data = [];

    }

    async activate() {
        await this.initialize();
        this.name = "";
        this.name = this.dataAccessService.getProperties().name;
        if (this.name == "" || this.name == null) {
            this.name = "Customer";
        }
        this.running = true;
        this.active = true;
    }

    notify(newData) {





        //<button onClick={this.handleClick} id="selectReadyButton">Ready</button>

    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
        this.data = [];
    }

}
class accelerationCmin extends tucana.minion.VisualizationCmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.x = 0;
        this.counter = 0;
        this.meanOfY = 0;
    }

    async activate() {
        await this.initialize();
        this.running = true;
        this.uiAdapter.showLineChart(this.instanceId);
    }

    /**
     * Terminates a running minion by clearing the runtime environment.
     */
    terminate() {
        this.running = false;
    }

    notify(newData) {

        this.counter++;
        var dat = newData['[Acc-X Acc-Y Acc-Z]'];

        var y = Math.round(Math.sqrt(Math.pow(dat[0], 2) + Math.pow(dat[1], 2) + Math.pow(dat[2], 2)));
        if ((this.counter % 10) === 0) {
            this.x++;
            y = this.meanOfY / 10;
            this.meanOfY = 0;
            var data = {x: this.x, y: y};

            if (this.running) {
                this.uiAdapter.addData(this.instanceId, data);
            }

        } else {
            this.meanOfY += y;

        }

    }

}
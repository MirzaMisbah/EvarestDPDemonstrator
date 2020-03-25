class Tmin1 extends tucana.minion.Tmin {


    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter = null, dependencies = []);

        this._this = this;
        this.data = [];
        this.dataId = id + Date.now();
        this.created = false;
        this.num = 0;
        this.dataBuffer1 = [];
        this.dataBuffer2 = [];
        this.tf = tucana.minion.tf;

    }


    async activate() {
        await this.initialize();
        this.running = true;
        this.model = await this.readModel('https://gist.githubusercontent.com/SaraKhan29/16e5f53b7024f4ecf687bfc5f1d41812/raw/ff338a0beed1aa534ab1b6841b5446a95bcbe240/modelUseCase.json');
        this.counter = 0;
    }

    async predictPartially(data){
        var result = this.model.predict(data);
        if(this.counter < 9) {
            this.counter += 1
        } else {
            this.counter = 0;
            result = await result.argMax(1);
            result = Array.from(result.dataSync())
            var resultScheme = {
                timestamp: Date.now(),
                type: 'Classification',
                valueContext: ['receptiveness'],
                value: result
            };
            console.log(result);

            this.data.push(resultScheme);
            if (this.created) {
                this.updateData(this.dataId, this.data)
            } else {
                this.saveData(this.dataId, this.data);
                this.created = true;
            }
            this.minionController.notify(this, resultScheme);
            this.model.resetStates();
        }
    }

    notify(newData) {

        if (newData.type === "location") {
            this.dataBuffer2.push(newData.value.splice(0,2));

        } else if (newData.type === "linear_acceleration") {
            this.dataBuffer1.push(newData.value);
        }
        if(this.dataBuffer1.length >= 10 && this.dataBuffer2.length >= 10){
            var t1 = this.tf.tensor(this.dataBuffer1.splice(0,10));
            var t2 = this.tf.tensor(this.dataBuffer2.splice(0,10));
            var data = this.tf.concat([t1,t2],1);
            data = data.expandDims(0)
            this.predictPartially(data);
        }
        return
    }


    terminate() {
        this.running = false;
        this.created = false;
        this.model = null;
    }

}

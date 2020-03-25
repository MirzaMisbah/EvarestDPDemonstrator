// TODO: Delete this unnecessary library.

class Minion {
    constructor(minionName, minionConfig) {
        this.minionName = minionName;
        const isBrowser = new Function("try {return self===window;}catch(e){ return false;}");
        this.browserEnv = function () {
            const isBrowser = new Function("try {return self===window;}catch(e){ return false;}");
            return !!isBrowser();
        }
    }
}


// This is an example implementation for an appropriate TMIN interface executing functions in a dedicated thread not dependand on the system environment

class Tmin extends Minion {
    constructor(minionName, minionCode) {
        super(minionName);
        const _this = this;
        this.code = minionCode;
        this.minionFunctionality = eval('(' + minionCode + ')');
        if (!this.browserEnv()) {
            this.workerCode = (function () {this.onmessage = function (msg) { postMessage({res : eval('(' + msg.data.fun + ')(msg.data.data)'), req : msg.data});}}).toLocaleString();
        }
        this.callback = [];
        this.initialize()
    }

    getWorkerCode() {
        return this.workerCode;
    }

    initialize () {
        const _this = this;
        if (!this.browserEnv()) {
            const Worker = require('webworker-threads').Worker;
            this.worker = new Worker(eval('(' + this.getWorkerCode() + ')'));
            this.worker.onmessage = function (res) {
                const id = res.data.req.id;
                const method = _this.callback[id];
                method.fun(res.data.res);
            };
        }
        return true;
    }

    execute(data) {
        return this.minionFunctionality(data);
    }

    call(data) {

        if (!this.browserEnv()){
            var _this = this;
            return new Promise((resolve, reject) => {
                const id = _this.callback.length;
                _this.callback.push({id: id, fun : function (res) {
                        if (res) {
                            resolve(res);
                        } else {
                            reject(null);
                        }
                    }});
                _this.worker.postMessage({data : data, id: id, fun : this.minionFunctionality.toLocaleString()});
            });
        } else {
            return Promise.resolve(this.execute(data));
        }
    }

    killWorker() {
        if (this.worker)
            this.worker.terminate();
        else {
            // TODO
        }
    }
}

module.exports.Minion = Minion;

module.exports.Tmin = Tmin;

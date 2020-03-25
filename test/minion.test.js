var expect = require('chai').expect;
const sinon = require('sinon');

var env = require('browser-env');
var minion_v1 = require('../src/coreplatform/minion');
var TucanaPlatform = sinon.stub();
var fetch = require('node-fetch');

class TestCmin extends minion_v1.Cmin {
    constructor(tucanaPlatform, dependencies=[
        {name : 'numjs', uri:'https://cdnjs.cloudflare.com/ajax/libs/numjs/0.16.0/numjs.js'}]){
        super(tucanaPlatform, dependencies);
    }

    start() {
        this.setRunning(true);
    }

    stop() {
        this.setRunning(false);
    }

    kill() {
        this.setRunning(false);
    }
}
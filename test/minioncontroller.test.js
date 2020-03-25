const MinionCommunicationMap = require('../src/coreplatform/minioncontroller').MinionCommunicationMap;
var expect = require('chai').expect;

describe('MinionCommunicationMap Tests', function(){

    it('adds new minion', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        expect(minionMap.getColumnRows().indexOf('TestMinion1')).to.be.equal(0);
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
    });

    it('adds two minions', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        minionMap.addMinion('TestMinion2');
        expect(minionMap.getColumnRows().indexOf('TestMinion1')).to.be.equal(0);
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(0);

        expect(minionMap.getColumnRows().indexOf('TestMinion2')).to.be.equal(1);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);
    });

    it('adds minion transition', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        minionMap.addMinion('TestMinion2');
        minionMap.addTransition('TestMinion1', 'TestMinion2');
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(1);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);
    });

    it('removes minion transition', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        minionMap.addMinion('TestMinion2');
        minionMap.addTransition('TestMinion1', 'TestMinion2');
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(1);

        expect(minionMap.getColumnRows().indexOf('TestMinion2')).to.be.equal(1);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);

        minionMap.removeTransition('TestMinion1', 'TestMinion2');
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(0);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);

    });

    it('returns correct targets', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        minionMap.addMinion('TestMinion2');
        minionMap.addMinion('TestMinion3');
        minionMap.addTransition('TestMinion1', 'TestMinion3');
        minionMap.addTransition('TestMinion1', 'TestMinion2');
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(1);
        expect(minionMap.getMap()[0][2]).to.be.equal(1);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);
        expect(minionMap.getMap()[1][2]).to.be.equal(0);
        expect(minionMap.getMap()[2][0]).to.be.equal(0);
        expect(minionMap.getMap()[2][1]).to.be.equal(0);
        expect(minionMap.getMap()[2][2]).to.be.equal(0);

        const targets = minionMap.getTargetMinionIDs('TestMinion1');
        expect(targets).to.include('TestMinion2');
        expect(targets).to.include('TestMinion3');
    });

    it('returns correct sources', async function(){
        const minionMap = new MinionCommunicationMap();
        minionMap.addMinion('TestMinion1');
        minionMap.addMinion('TestMinion2');
        minionMap.addMinion('TestMinion3');
        minionMap.addTransition('TestMinion1', 'TestMinion3');
        minionMap.addTransition('TestMinion2', 'TestMinion3');
        expect(minionMap.getMap()[0][0]).to.be.equal(0);
        expect(minionMap.getMap()[0][1]).to.be.equal(0);
        expect(minionMap.getMap()[0][2]).to.be.equal(1);
        expect(minionMap.getMap()[1][0]).to.be.equal(0);
        expect(minionMap.getMap()[1][1]).to.be.equal(0);
        expect(minionMap.getMap()[1][2]).to.be.equal(1);
        expect(minionMap.getMap()[2][0]).to.be.equal(0);
        expect(minionMap.getMap()[2][1]).to.be.equal(0);
        expect(minionMap.getMap()[2][2]).to.be.equal(0);

        const sources = minionMap.getSourceMinionIDs('TestMinion3');
        expect(sources).to.include('TestMinion1');
        expect(sources).to.include('TestMinion2');

        const emptySources = minionMap.getSourceMinionIDs('TestMinion1');
        expect(emptySources).to.not.include('TestMinion1');
        expect(emptySources).to.not.include('TestMinion2');
        expect(emptySources).to.not.include('TestMinion3');
    });
});

describe('MinionController Tests', function() {
    // TODO write tests for the minion controller
});
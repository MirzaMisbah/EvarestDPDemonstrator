var DataRequestStateController = require('../src/dataallocation/datarequeststatecontroller').DataRequestStateController;
var CRUDOperation = require('../src/model').CRUDOperation;
var BroadcastConfiguration = require('../src/model').BroadcastConfiguration;
var State = require('../src/dataallocation/datarequeststatecontroller').State;
var expect = require('chai').expect;
const sinon = require('sinon');


var DataAccessController = sinon.stub();
DataAccessController.prototype.executeCRUDOperation = sinon.stub().callsFake(async (crudOperation) => {
    return await {status : 'success', success : true, message : 'DatabaseHandler Operation successful.'};
});

function initAccessServiceGrantingAccess () {

    DataAccessController.prototype.broadcastRessourceAccess = sinon.stub().callsFake(async (crudOperation) => {
        return {req: crudOperation, res : {status: 'provided', success : true}};
    });

}

function initAccessServiceDeniyingAccess () {

    DataAccessController.prototype.broadcastRessourceAccess = sinon.stub().callsFake(async (crudOperation) => {
        return await [{req: crudOperation, res : {status: 'protected', success : true}}];
    });
    DataAccessController.prototype.requestAccessPermission = sinon.stub().callsFake(async (crudOperation) => {
        return await {req: crudOperation, res : {status: 'provided', success : true}};
    })
}

describe('State Machine Test Suite', function(){
    it('prevents wrong state initialization', function(){
        try {
            const state = new State();
        } catch (e) {
            expect(true);
        }
    });

    it('has the right initial state', function(){
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();

        const tucanaStateMachine = new DataRequestStateController(dataAccessService);
        const currentState = tucanaStateMachine.getCurrentState().toString();
        expect(currentState).to.be.equal('Idle');
    });

    it('prevents disallowed executeLocalOperation transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();

        const tucanaStateMachine = new DataRequestStateController(dataAccessService);
        const result = await tucanaStateMachine.executeLocalOperation(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed requestBroadcastCRUDOperation transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.requestBroadcastCRUDOperation(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed broadcastRessourceAccess transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.broadcastRessourceAccess(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed ressourceProtected transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.ressourceProtected(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed requestRessourceAccess transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.requestRessourceAccess(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed ressourceProvided transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.ressourceProvided(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('prevents disallowed broadcastOperationExecuted transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let result = await tucanaStateMachine.broadcastOperationExecuted(new CRUDOperation());
        expect(result.success).to.be.equal(false);

    });

    it('prevents disallowed requestCRUDOperation transistion properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        tucanaStateMachine.setCurrentState(tucanaStateMachine.getBroadcastRequestReceived());
        let result = await tucanaStateMachine.requestCRUDOperation(new CRUDOperation());
        expect(result.success).to.be.equal(false);
    });

    it('executes local database operation properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        const result = await tucanaStateMachine.requestCRUDOperation(new CRUDOperation());
        expect(result.success).to.be.equal(true);
        const nextState = tucanaStateMachine.getCurrentState().toString();
        expect(nextState).to.be.equal('Idle');
    });

    it('executes remote database operation properly', async function () {
        initAccessServiceGrantingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        let remoteConfiguration;
        const result = await tucanaStateMachine.requestCRUDOperation(new CRUDOperation(null, null, null, null, new BroadcastConfiguration('test1@test.com', ['test@test.com'])));
        expect(result.success).to.be.equal(true);

        const nextState = tucanaStateMachine.getCurrentState().toString();
        expect(nextState).to.be.equal('Idle');

    });

    it('executes denied remote database operation properly', async function () {
        initAccessServiceDeniyingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        const result = await tucanaStateMachine.requestCRUDOperation(new CRUDOperation(null, null, null, null, new BroadcastConfiguration('test1@test.com', ['test@test.com'])));
        expect(result.success).to.be.equal(true);

        const nextState = tucanaStateMachine.getCurrentState().toString();
        expect(nextState).to.be.equal('RessourceAccessProtected');

    });

    it('executes denied remote database operation and asks for access properly', async function () {
        initAccessServiceDeniyingAccess();

        const dataAccessService = new DataAccessController();
        const tucanaStateMachine = new DataRequestStateController(dataAccessService);

        const result = await tucanaStateMachine.requestCRUDOperation(new CRUDOperation(null, null, null, null, new BroadcastConfiguration('test1@test.com', ['test@test.com'])));
        expect(result.success).to.be.equal(true);

        const nextState = tucanaStateMachine.getCurrentState().toString();
        expect(nextState).to.be.equal('RessourceAccessProtected');

        const request = await tucanaStateMachine.requestRessourceAccess(new CRUDOperation(null, null, null, null, new BroadcastConfiguration('test1@test.com', 'test@test.com')));
        expect(request.success).to.be.equal(true);
        const finalState = tucanaStateMachine.getCurrentState().toString();
        expect(finalState).to.be.equal('Idle');



    });
});
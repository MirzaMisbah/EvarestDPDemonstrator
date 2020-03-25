const TucanaCoreService = require('../src/tucana').TucanaCoreService;
const model = require('../src/model');
const expect = require('chai').expect;
const sinon = require('sinon');

const TENVIdentificationHandler = sinon.stub();
const UPeerCommunicationHandler = sinon.stub();
const BaaSCommunicationHandler = sinon.stub();
const DatabaseHandler = sinon.stub();
DatabaseHandler.prototype.executeLocalCRUDOperation = sinon.stub().callsFake(async (crudOperation) => {
    return await {status : 'success', success : true, message : 'DatabaseHandler Operation successful.'};
});

UPeerCommunicationHandler.prototype.init = sinon.stub().callsFake((tucanaPlatform) => {
    return true;
});

UPeerCommunicationHandler.prototype.broadcastRessourceAccess = sinon.stub().callsFake(async (crudOperation) => {
    return {req: crudOperation, res : {status: 'protected', success : true}};
});





describe('Tucana Core Tests', function(){

});
var CRUD = require('../src/model').CRUD_OPERATION_TYPE;
var OBJECTTYPE = require('../src/model').OBJECT_TYPE;

var CRUDOperation = require('../src/model').CRUDOperation;

var Query = require('../src/model').DatabaseQuery;

var DomainItem = require('../src/model').DomainItem;
var SoftwareItem = require('../src/model').SoftwareItem;
var ModelItem = require('../src/model').ModelItem;
var BroadcastConfiguration = require('../src/model').BroadcastConfiguration;

const sinon = require('sinon');
var expect = require('chai').expect;

describe('CRUDOperation Test Suite', function() {

    const query = new Query();
    let remote = new BroadcastConfiguration('test1@test.com', ['test2@test.com']);
    const crudOperation = new CRUDOperation(CRUD.READ, OBJECTTYPE.DATA, null, query, remote);

    it('getOperationType', function () {
        expect(crudOperation.getOperationType()).to.be.equal(CRUD.READ);
    });

    it('getObjectType', function () {
        expect(crudOperation.getObjectType()).to.be.equal(OBJECTTYPE.DATA);
    });

    it('getObject', function () {
        try {
            crudOperation.getObject();
        } catch (e) {
            expect(true);
        }
    });

    it('getQuery', function () {
        expect(crudOperation.getQuery()).to.be.equal(query);
    });

    it('getBroadcastConfiguration', function () {
        expect(crudOperation.getBroadcastConfiguration()).to.be.equal(remote);
    });

    it('getRemoteTargets', function () {
        expect(JSON.stringify(crudOperation.getBroadcastTargets())).to.be.equal(JSON.stringify(['test2@test.com']));
    });

    it('setOperationType', function () {
        crudOperation.setOperationType(CRUD.CREATE);
        expect(crudOperation.getOperationType()).to.be.equal(CRUD.CREATE);
    });

    it('setObjectType', function () {
        crudOperation.setObjectType(OBJECTTYPE.MODEL);
        expect(crudOperation.getObjectType()).to.be.equal(OBJECTTYPE.MODEL);
    });

    it('setObject', function () {
        const obj = {};
        crudOperation.setObject(obj);
        expect(crudOperation.getObject()).to.be.equal(obj);
    });

    it('setQuery', function () {
        crudOperation.setQuery(null);
        try {
            crudOperation.getQuery();
        } catch (e) {
            expect(true);
        }
    });

    it('getBroadcastConfiguration', function () {
        remote = {
            target : ['test', 'hello']
        };
        expect(crudOperation.getBroadcastConfiguration()).not.to.be.equal(remote);
        crudOperation.setBroadcastConfiguration(remote);
        expect(crudOperation.getBroadcastConfiguration()).to.be.equal(remote);
    });
});


describe('DomainItem, SoftwareItem and ModelItem Test Suite', function() {

    const dataObject = {value : 'This is a test value'};
    const dataId = '123456789';
    const domainItem = new DomainItem(dataId, dataObject);

    const TestMinion = class {
        constructor(minionId) {
            this.minionId = minionId;
        }

        getMinionId () {
            return this.minionId;
        }
    };
    const softwareId = 'TestMinion';
    const softwareItem = new SoftwareItem(softwareId, TestMinion.toString());

    const modelId = 'TestModel';
    const modelObject = {architecure : null, weigths : null};
    const modelItem = new ModelItem(modelId, modelObject);


    it('testDomainItem', function () {
        expect(domainItem.getId()).to.be.equal(dataId);
        expect(domainItem.getObject()).to.be.equal(dataObject);
        domainItem.setId('123654789');
        expect(domainItem.getId()).to.be.equal('123654789');
        const newObject = {value : 'This is a new test value'};
        domainItem.setObject(newObject);
        expect(domainItem.getObject()).to.be.equal(newObject);
    });

    it('testModelItem', function () {
        expect(modelItem.getId()).to.be.equal(modelId);
        expect(modelItem.getModel()).to.be.equal(modelObject);
        modelItem.setId('NewTestModel');
        expect(modelItem.getId()).to.be.equal('NewTestModel');
        const newObject = {architecure : null};
        modelItem.setModel(newObject);
        expect(modelItem.getModel()).to.be.equal(newObject);
    });

    it('testSoftwareItem', function () {
        expect(softwareItem.getId()).to.be.equal(softwareId);
        expect(softwareItem.getCode()).to.be.equal(TestMinion.toString());
        expect(new (softwareItem.getClass())('testMin').getMinionId()).to.be.equal('testMin');

        softwareItem.setId('NewTestMinion');
        expect(softwareItem.getId()).to.be.equal('NewTestMinion');

        softwareItem.setCode(TestMinion.toString());
        expect(softwareItem.getCode()).to.be.equal(TestMinion.toString());
    });
});
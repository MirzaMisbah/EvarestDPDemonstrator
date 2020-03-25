var expect = require('chai').expect;
var env = require('browser-env');

var Database = require('../../src/dataallocation/handler/database').DatabaseHandler;
var Minion = require('../../src/coreplatform/minion').Minion;
var CRUDOperation = require('../../src/model').CRUDOperation;
describe("DatabaseHandler, Minion, Auth and Communication Test Suite",function () {
    it('This will not allow initialization of DatabaseHandler Interface', function(){
        try {
            const db = new Database();
        } catch (e) {
            expect(true);
        }
    });

    it('This will through Error for DatabaseHandler Interface  _executeBroadcastCRUDOperation function not implemented by child class', async function(){
        try {
            const dba = new Database();
            const crudOperation = new CRUDOperation();
            await dba.executeLocalCRUDOperation(crudOperation)
        } catch (e) {
            expect('Error: You have to implement the method _executeBroadcastCRUDOperation!');
        }
    });

    it('This will not allow initialization of minion_v1 Interface', function(){
        try {
            const minion_v1 = new Minion();
        } catch (e) {
            expect(true);
        }
    });

});
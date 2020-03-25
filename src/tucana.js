module.exports.minion = require('./coreplatform/minion');
module.exports.minionstate = require('./coreplatform/minionstatecontroller');
module.exports.adapter = require('./adapter');
module.exports.model = require('./model');
module.exports.DatabaseHandler = require('./dataallocation/handler/databasehandler').DatabaseHandler;
module.exports.UPeerCommunicationHandler = require('./dataallocation/handler/peercommunicationhandler').UPeerCommunicationHandler;
module.exports.BaaSCommunicationHandler = require('./dataallocation/handler/baascommunicationhandler').BaaSCommunicationHandler;
module.exports.TENVIdentificationHandler = require('./dataallocation/handler/tenvidentificationhandler').TENVIdentificationHandler;

// module.exports.tf = require('@tensorflow/tfjs');
// module.exports.tfvis = require('@tensorflow/tfjs-vis');

const DataAccessService = require('./dataallocation/dataaccessservice').DataAccessService;
const SmartServiceController = require('./coreplatform/smartservicecontroller').SmartServiceController;
const MinionStateController = require('./coreplatform/minionstatecontroller').MinionStateController;
const model = require('./model');

// TODO: Add Comments; Revise overall stream of functionality (Are all Interfaces provided as functions that should be provided for executing the core concepts of the tucana platform?)
/**
 * @class
 */
class TucanaCoreService {

    constructor(databaseHandler, upeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler, uiAdapter) {
        this.databaseHandler = databaseHandler;
        this.tenvIdentificationHandler = tenvIdentificationHandler;
        this.upeerCommunicationHandler = upeerCommunicationHandler;
        this.upeerCommunicationHandler.init(this);
        this.baasCommunicationHandler = baasCommunicationHandler;
        this.uiAdapter = uiAdapter;

        this.dataAccessService = new DataAccessService(databaseHandler, upeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler);
        this.smartServiceController = new SmartServiceController(this.dataAccessService, this.uiAdapter);
        this.minionStateController = new MinionStateController(this.smartServiceController);
    }

    async getSmartServiceConfigurationItemIds() {
        if (this.getLocalID()) {
            return await this.minionStateController.getSmartServiceConfigurationItemIds();
        } else {
            return null;
        }
    }

    async loadSmartServiceConfiguration(smartServiceConfigurationId) {
        if (this.getLocalID()) {
            return this.minionStateController.loadSmartServiceConfiguration(smartServiceConfigurationId);
        } else {
            return null;
        }
    }

    cancelExecution() {
        if (this.getLocalID()) {
            return this.minionStateController.cancel();
        } else {
            return null;
        }
    }

    async removeProtection(smartServiceConfigurationItem, response) {
        if (this.getLocalID()) {
            return await this.minionStateController.removeProtection(smartServiceConfigurationItem, response)
        } else {
            return null;
        }
    }

    async runSmartService() {
        return await this.minionStateController.runSmartService();
    }

    terminateSmartService() {
        return this.minionStateController.terminateSmartService();
    }

    async createSmartServiceConfiguration(smartServiceConfiguration) {
        if (this.getLocalID()) {
            const crudOperation = new model.CRUDOperation(model.CRUD_OPERATION_TYPE.CREATE, model.OBJECT_TYPE.SMART_SERVICE, smartServiceConfiguration, null, null);
            const result = await this.dataAccessService.requestCRUDOperation(crudOperation);
            return result;
        } else {
            return null;
        }
    }

    getIdentificationHandler() {
        return this.tenvIdentificationHandler;
    }

    getLocalID() {
        return this.dataAccessService.getLocalID();
    }
    getProperties() {
        return this.dataAccessService.getProperties();
    }

    _initializePlatform() {
        // TODO Load the Smart Services.
        console.warn('This method is not implemented yet!');
    }

    /**
     * Request for a new CRUDOperation to be executed in the back.
     * @param {CRUDOperation} crudOperation: The CRUDOperation object to be requested.
     * @return {Promise<Object>}: The result of the request.
     */
    async requestCRUDOperation (crudOperation) {
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Notifies all minions for new data arrival.
     * @param {DomainItem} dataItem: The new DomainItem.
     */
    notifyMinions(dataItem) {
        this.smartServiceController.notifyMinions(null, dataItem);
    }

    /**
     * Starts a service given its configuration id:
     * @param {string} smartServiceConfigurationId: The id of the SmartServiceConfigurationItem object to be started.
     * @return {Promise<Object>}: The result of the request.
     */
    async startService(smartServiceConfigurationId) {
        const result = await this.loadSmartServiceConfiguration(smartServiceConfigurationId);
        if (result.success && result.state instanceof tucana.minionstate.MinionsBound) {
            return await this.runSmartService();
        }

    }
}

module.exports.TucanaCoreService = TucanaCoreService;
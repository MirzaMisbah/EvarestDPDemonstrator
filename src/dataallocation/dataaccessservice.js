const DataRequestStateController = require('./datarequeststatecontroller').DataRequestStateController;
const DataAccessController = require('./dataaccesscontroller').DataAccessController;

// TODO: Add Comments

/**
 * Class for handling the data access of the TUCANA Core Service in the backend.
 * @class
 */
class DataAccessService {

    /**
     * Creates the data access object given the three adapters.
     * @param {DatabaseHandler} databaseHandler: The database of the service.
     * @param {UPeerCommunicationHandler} uPeerCommunicationHandler: The UPeerCommunicationHandler of the service.
     * @param {BaaSCommunicationHandler} baasCommunicationHandler: The BaaSCommunicationHandler of the service.
     * @param {TENVIdentificationHandler} tenvIdentificationHandler: The TENVIdentificationHandler of the service.
     */
    constructor(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler) {
        this.dataAccessController = new DataAccessController(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler);
        this.dataRequestStateController = new DataRequestStateController(this.dataAccessController);
    }

    async requestCRUDOperation(crudOperation) {
        return await this.dataRequestStateController.requestCRUDOperation(crudOperation);
    }
    NewrequestCRUDOperation(crudOperation) {
        return this.dataRequestStateController.NewrequestCRUDOperation(crudOperation);
    }

    async requestRessourceAccess(crudOperation) {
        return await this.dataRequestStateController.requestRessourceAccess(crudOperation);
    }

    async cancelBroadcastOperation (crudOperation) {
        return await this.dataRequestStateController.cancelBroadcastOperation(crudOperation);
    }

    /**
     * Returns all IDs of the Domain Items in the local database.
     * @return {Promise<Array>} The IDs of the domain items.
     */
    async getDomainItemIds () {
        return await this.dataAccessController.getDomainItemIds();
    }

    /**
     * Returns all IDs (names) of the Software Items in the local database.
     * @return {Promise<Array>} The names of the software items.
     */
    async getSoftwareItemIds () {
        return await this.dataAccessController.getSoftwareItemIds();
    }

    /**
     * Returns all IDs of the Model Items in the local database.
     * @return {Promise<Array>} The IDs of model items.
     */
    async getModelItemIds () {
        return await this.dataAccessController.getModelItemIds();
    }

    /**
     * Returns all IDs of the Smart Service Configuration Items in the local database.
     * @return {Promise<Array>} The IDs of Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIds () {
        return await this.dataAccessController.getSmartServiceConfigurationItemIds();
    }

    /**
     * Returns the local ID of the peer.
     * @return {String} The peers local ID.
     */
    getLocalID() {
        return this.dataAccessController.getLocalID();
    }

    /**
     * Return the properties of the peer.
     * @return {Map} The peers properties.
     */
    getProperties(){
        return this.dataAccessController.getProperties();
    }

    /**
     * Returns all peers available in the network that fulfill the given properties.
     * @param {Array} properties: The properties to match.
     * @return {Promise<Array>} The list of available peer IDs.
     */
    async getFilteredPeerIds(properties) {
        return await this.dataAccessController.getFilteredPeerIds(properties);
    }

    getDataRequestStateController() {
        return this.dataRequestStateController;
    }
}

module.exports.DataAccessService = DataAccessService;

const model = require('../model');

// TODO: Revise functionality e.g. broadcastRessourceAccess does provide the minions already if found and does not only check whether the minion is available or not.

/**
 * Class for handling the data access of the TUCANA Core Service in the backend.
 * @class
 */
class DataAccessController {

    /**
     * Creates the data access object given the three adapters.
     * @param {DatabaseHandler} databaseHandler: The database of the service.
     * @param {UPeerCommunicationHandler} uPeerCommunicationHandler: The UPeerCommunicationHandler of the service.
     * @param {BaaSCommunicationHandler} baasCommunicationHandler: The BaaSCommunicationHandler of the service.
     * @param {TENVIdentificationHandler} tenvIdentificationHandler: The TENVIdentificationHandler of the service.
     */
    constructor(databaseHandler, uPeerCommunicationHandler, baasCommunicationHandler, tenvIdentificationHandler) {
        this.database = databaseHandler;
        this.uPeerCommunicationHandler = uPeerCommunicationHandler;
        this.baasCommunicationHandler = baasCommunicationHandler;
        this.tenvIdentificationHandler = tenvIdentificationHandler;
    }

    /**
     * Returns all IDs of the Domain Items in the local database.
     * @return {Promise<Array>} The IDs of the domain items.
     */
    async getDomainItemIds() {
        return await this.database.getDomainItemIDs();
    }

    /**
     * Returns all IDs (names) of the Software Items in the local database.
     * @return {Promise<Array>} The names of the software items.
     */
    async getSoftwareItemIds() {
        return await this.database.getSoftwareItemIDs();
    }

    /**
     * Returns all IDs of the Model Items in the local database.
     * @return {Promise<Array>} The IDs of model items.
     */
    async getModelItemIds() {
        return await this.database.getModelItemIDs();
    }

    /**
     * Returns all IDs of the Smart Service Configuration Items in the local database.
     * @return {Promise<Array>} The IDs of Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.database.getSmartServiceConfigurationItemIDs();
    }

    /**
     * Returns the local ID of the peer.
     * @return {String} The peers local ID.
     */
    getLocalID() {
        return this.tenvIdentificationHandler.getLocalID();
    }

    /**
     * Returns all properties of the peer.
     * @return {Object}: The properties of the peer.
     */
    getProperties() {
        return this.tenvIdentificationHandler.getProperties();
    }

    /**
     * Returns all peers available in the network that fulfill the given properties.
     * @param {Array} properties: The properties to match.
     * @return {Promise<Array>} The list of available peer IDs.
     */
    async getFilteredPeerIds(properties) {
        return await this.uPeerCommunicationHandler.getFilteredPeerIds(properties);
    }

    /**
     * Checks access of a specified peer and returns the result i.e. the requested ressources or the availability status of the minion.
     * @param {CRUDOperation} crudOperation: The specified CRUDOperation.
     * @return {Array<Promise<Object>>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        if (crudOperation.getBroadcastConfiguration().getType() === model.BROADCAST_TYPE.UPEER) {
            return await this.uPeerCommunicationHandler.broadcastRessourceAccess(crudOperation);
        } else {
            return await this.baasCommunicationHandler.broadcastRessourceAccess(crudOperation);
        }

    }
    NewbroadcastRessourceAccess(crudOperation) {
        if (crudOperation.getBroadcastConfiguration().getType() === model.BROADCAST_TYPE.UPEER) {
            return this.uPeerCommunicationHandler.NewbroadcastRessourceAccess(crudOperation);
        } else {
            return this.baasCommunicationHandler.NewbroadcastRessourceAccess(crudOperation);
        }
        
    }

    /**
     * Requests for access at a set of given target peers and returns the requests result i.e. provides ressources or not.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async requestAccessPermission(crudOperation) {
        // TODO: Mechanism for payed transactions necessary.
        console.warn('Method requestAccessPermission not implemented, redirecting to RessourceNotAvailable State.');
        return await {
            req: {crudOperation: crudOperation},
            res: {success: false, status: 'not_available', message: 'Ressource not available.'}
        };
    }

    /**
     * Executes a CRUDOperation.
     * @param {CRUDOperation} crudOperation: The local or remote CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async executeCRUDOperation(crudOperation) {
        if (crudOperation.getBroadcastConfiguration()) {
            return await this.broadcastRessourceAccess(crudOperation);
        } else {
            return await this.executeLocalCRUDOperation(crudOperation);
        }
    
    }
    NewexecuteCRUDOperation(crudOperation) {
        if (crudOperation.getBroadcastConfiguration()) {
            return this.NewbroadcastRessourceAccess(crudOperation);
        } else {
            return this.NewexecuteLocalCRUDOperation(crudOperation);
        }
    
    }


    /**
     * Executes a CRUDOperation within the local environment of the peer.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Response>} The result of the request.
     */
    async executeLocalCRUDOperation(crudOperation) {
        return await this.database.executeLocalCRUDOperation(crudOperation);
    }
    async NewexecuteLocalCRUDOperation(crudOperation) {
        return this.database.NewexecuteLocalCRUDOperation(crudOperation);
    }

}

module.exports.DataAccessController = DataAccessController;

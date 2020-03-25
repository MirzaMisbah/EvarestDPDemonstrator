const model = require('../../model');
// TODO: Add Comments

/**
 * @interface
 */
class BaaSCommunicationHandler {

    /**
     * Creates a new instance of the BaaSCommunicationHandler
     */
    constructor() {
        if (new.target === BaaSCommunicationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }

        Object.defineProperty(this, 'tucanaPlatform', {get : function () {
                return null;
            }});

        Object.defineProperty(this, 'initialized', {get : function () {
                return false;
            }});

    }

    /**
     * Executes a new CRUDOperation as a BaaS broadcast.
     * @param {CRUDOperation} crudOperation: The CRUDOperation to be executed.
     * @return {Promise<Object>} The result of the operation
     */
    async broadcastRessourceAccess(crudOperation) {
        if (crudOperation.getObjectType() === model.OBJECT_TYPE.SOFTWARE) {
            return await this.broadcastSBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.DATA) {
            return await this.broadcastDBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.SMART_SERVICE) {
            return await this.broadcastSSCBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.MODEL) {
            return await this.broadcastMBaaS(crudOperation);
        }
    }
    NewbroadcastRessourceAccess(crudOperation) {
        if (crudOperation.getObjectType() === model.OBJECT_TYPE.SOFTWARE) {
            return this.broadcastSBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.DATA) {
            return this.broadcastDBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.SMART_SERVICE) {
            return this.broadcastSSCBaaS(crudOperation);
        } else if (crudOperation.getObjectType() === model.OBJECT_TYPE.MODEL) {
            return this.broadcastMBaaS(crudOperation);
        }
    }

    /**
     * This function can be used to fetch software items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastSBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSBaaS!');
    }
    NewbroadcastSBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSBaaS!');
    }

    /**
     * This function can be used to fetch domain items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastDBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastDBaaS!');
    }
    NewbroadcastDBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastDBaaS!');
    }
    /**
     * This function can be used to fetch smart service configuration items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastSSCBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSSCBaaS!');
    }
    NewbroadcastSSCBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastSSCBaaS!');
    }
    /**
     * This function can be used to fetch model items.
     * @param {CRUDOperation} crudOperation
     * @return {Array<Promise<Object>>}
     */
    async broadcastMBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastMBaaS!');
    }
    NewbroadcastMBaaS(crudOperation) {
        throw new Error('You have to implement the method broadcastMBaaS!');
    }
}

module.exports.BaaSCommunicationHandler = BaaSCommunicationHandler;
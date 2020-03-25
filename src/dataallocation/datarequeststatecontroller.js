const model = require('../model');
/**
 * @class
 */
class DataRequestStateController {

    /**
     * Creates a new DataRequestStateController (state machine) Object.
     * @param {DataAccessController} dataAccessController: The underlying DataAccessController Object.
     */
    constructor(dataAccessController) {
        this.idle = new Idle(this, dataAccessController);
        this.requestReceived = new RequestReceived(this, dataAccessController);
        this.broadcastRequestReceived = new BroadcastRequestReceived(this, dataAccessController);
        this.awaitBroadcastResponse = new AwaitBroadcastResponse(this, dataAccessController);
        this.ressourceAccessProtected = new RessourceAccessProtected(this, dataAccessController);
        this.ressourceAccessProvided = new RessourceAccessProvided(this, dataAccessController);
        this.ressourceAccessNotAvailable = new RessourceAccessNotAvailable(this, dataAccessController);

        this.currentState = this.idle;
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        return await this.currentState.requestCRUDOperation(crudOperation);
    }
    NewrequestCRUDOperation() {
        return this.currentState.NewrequestCRUDOperation();
    }

    /**
     * Will be called when the CRUD operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        return await this.currentState.requestBroadcastCRUDOperation(crudOperation);
    }

    NewrequestBroadcastCRUDOperation(crudOperation) {
        return this.currentState.NewrequestBroadcastCRUDOperation(crudOperation);
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        return await this.currentState.broadcastRessourceAccess(crudOperation);
    }
    NewbroadcastRessourceAccess(crudOperation) {
        return this.currentState.NewbroadcastRessourceAccess(crudOperation);
    }

    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response) {
        return await this.currentState.ressourceProtected(crudOperation, response);
    }
    NewressourceProtected(crudOperation, response) {
        return this.currentState.ressourceProtected(crudOperation, response);
    }
    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response) {
        return await this.currentState.ressourceProvided(crudOperation, response);
    }


    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable(crudOperation, response) {
        return await this.currentState.ressourceNotAvailable(crudOperation, response);
    }
    NewressourceNotAvailable(crudOperation, response) {
        return this.currentState.NewressourceNotAvailable(crudOperation, response);
    }
    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        return await this.currentState.requestRessourceAccess(crudOperation);
    }
    NewrequestRessourceAccess(crudOperation) {
        return this.currentState.NewrequestRessourceAccess(crudOperation);
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted(crudOperation, response) {
        return await this.currentState.broadcastOperationExecuted(crudOperation, response);
    }
    async broadcastOperationExecuted(crudOperation, response) {
        return await this.currentState.broadcastOperationExecuted(crudOperation, response);
    }
    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation) {
        return await this.currentState.executeLocalOperation(crudOperation);
    }
    NewexecuteLocalOperation(crudOperation) {
        return this.currentState.NewexecuteLocalOperation(crudOperation);
    }

    /**
    * Cancels the remote CRUD operation.
    * @param {CRUDOperation} crudOperation: The operation to be executed.
    * @param {Object} response: The response of the target peers.
    * @return {Promise<Object>} The result of the request.
    */
    async cancelBroadcastOperation(crudOperation, response = null) {
        return await this.currentState.cancelBroadcastOperation(crudOperation, response);
    }
    NewcancelBroadcastOperation(crudOperation, response = null) {
        return this.currentState.NewcancelBroadcastOperation(crudOperation, response);
    }

    /**
     * Set the current state of the state machine.
     * @param {State} newState: The new state.
     */
    setCurrentState(newState) {
        this.currentState = newState;
    }

    /**
     * Get the current state of the machine.
     * @return {State} The current state.
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get the Idle State.
     * @return {Idle} The Idle State.
     */
    getIdle() {
        return this.idle;
    }

    /**
     * Get the RequestReceived State.
     * @return {RequestReceived} The RequestReceived State.
     */
    getRequestReceived() {
        return this.requestReceived;
    }

    /**
     * Get the BroadcastRequestReceived State.
     * @return {BroadcastRequestReceived} The BroadcastRequestReceived State.
     */
    getBroadcastRequestReceived() {
        return this.broadcastRequestReceived;
    }

    /**
     * Get the AwaitBroadcastResponse State.
     * @return {AwaitBroadcastResponse} The AwaitBroadcastResponse State.
     */
    getAwaitBroadcastResponse() {
        return this.awaitBroadcastResponse;
    }

    /**
     * Get the RessourceAccessProtected State.
     * @return {RessourceAccessProtected} The RessourceAccessProtected State.
     */
    getRessourceAccessProtected() {
        return this.ressourceAccessProtected;
    }

    /**
     * Get the RessourceAccessProvided State.
     * @return {RessourceAccessProvided} The RessourceAccessProvided State.
     */
    getRessourceAccessProvided() {
        return this.ressourceAccessProvided;
    }

    /**
     * Get the RessourceAccessNotAvailable State.
     * @return {RessourceAccessNotAvailable} The RessourceAccessNotAvailable State.
     */
    getRessourceAccessNotAvailable() {
        return this.ressourceAccessNotAvailable;
    }
}

class State {
    constructor(dataRequestStateController) {
        if (new.target === State) {
            throw new TypeError('Abstract classes cannot be instantiated.')
        }
        Object.defineProperty(this, 'dataRequestStateController', {
            get: function () {
                return dataRequestStateController;
            }
        });
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }
    NewrequestCRUDOperation() {
        return false;
    }

    /**
     * Will be called when the CRUD Operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }
    NewrequestBroadcastCRUDOperation() {
        return true;
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }
    NewbroadcastRessourceAccess(crudOperation) {
        return true;
    }
    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable(crudOperation, response) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted(crudOperation, response) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }

    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }


    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response = null) {
        return await { status: 'failed', success: false, message: 'This operation is not executable in the current state.', state: this.dataRequestStateController.getCurrentState() };
    }
}

/**
 * @class
 */
class Idle extends State {

    /**
     * Constructor for the Idle State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * This function should define behaviour of a single CRUD operation
     * @param {CRUDOperation} crudOperation: The CRUD operation to be executed of type CRUDOperation
     * @return {Promise<Object>} The result of the request.
     */
    async requestCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRequestReceived());
        let broadcast = false;
        try {
            broadcast = crudOperation.getBroadcastConfiguration();
        } catch (e) {
            broadcast = false;
        }
        if (broadcast) {
            return await this.dataRequestStateController.requestBroadcastCRUDOperation(crudOperation);
        } else {
            return await this.dataRequestStateController.executeLocalOperation(crudOperation);
        }
    }
    NewrequestCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRequestReceived());
        let broadcast = false;
        try {
            broadcast = crudOperation.getBroadcastConfiguration();
        } catch (e) {
            broadcast = false;
        }
        if (broadcast) {
            return this.dataRequestStateController.NewrequestCRUDOperation(crudOperation);
        } else {
            return this.dataRequestStateController.NewrequestCRUDOperation(crudOperation);
        }
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RequestReceived extends State {

    /**
     * Constructor for the RequestReceived State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executes a local CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async executeLocalOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        const operationStatus = await this.dataAccessController.executeCRUDOperation(crudOperation);
        return { status: 'provided', success: true, message: 'Operation was successfully executed.', state: this.dataRequestStateController.getCurrentState(), response: { req: crudOperation, res: operationStatus } };
    }

    /**
     * Will be called when the CRUD Operation is of type broadcast.
     * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestBroadcastCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getBroadcastRequestReceived());
        return await this.dataRequestStateController.broadcastRessourceAccess(crudOperation);
    }
    NewrequestBroadcastCRUDOperation(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getBroadcastRequestReceived());
        return this.dataRequestStateController.broadcastRessourceAccess(crudOperation);
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class BroadcastRequestReceived extends State {

    /**
     * Constructor for the BroadcastRequestReceived State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Broadcasts a ressource request.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastRessourceAccess(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getAwaitBroadcastResponse());
        const _this = this;
        const response = await this.dataAccessController.broadcastRessourceAccess(crudOperation);
        if (crudOperation.getBroadcastConfiguration().getBroadcastCondition() === model.BROADCAST_CONDITION.ANY) {
            let protected_condition = false;
            for (let i = 0; i < response.length; i++) {
                if (response[i].res.status === 'provided') {
                    return await _this.dataRequestStateController.ressourceProvided(crudOperation, response);
                } else {
                    if (response[i].res.status === 'protected') {
                        protected_condition = true;
                    }
                }
            }
            if (protected_condition) {
                return await _this.dataRequestStateController.ressourceProtected(crudOperation, response);
            } else {
                return await _this.dataRequestStateController.ressourceNotAvailable(crudOperation, response);
            }
        } else {
            let protected_condition = false;
            for (let i = 0; i < response.length; i++) {
                if (response[i].res.status === 'protected') {
                    protected_condition = true;
                } else if (response[i].res.status === 'failed') {
                    return await _this.dataRequestStateController.ressourceNotAvailable(crudOperation, response);
                }
            }
            if (protected_condition) {
                return await _this.dataRequestStateController.ressourceProtected(crudOperation, response);
            } else {
                return await _this.dataRequestStateController.ressourceProvided(crudOperation, response);
            }
        }
    }
    NewbroadcastRessourceAccess(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getAwaitBroadcastResponse());
        const _this = this;
        const response = this.dataAccessController.NewbroadcastRessourceAccess(crudOperation);
        if (crudOperation.getBroadcastConfiguration().getBroadcastCondition() === model.BROADCAST_CONDITION.ANY) {
            
    }
}

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class AwaitBroadcastResponse extends State {

    /**
     * Constructor for the AwaitBroadcastResponse State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executed when data access is protected.
     * @param {CRUDOperation} crudOperation: The inital operation.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProtected(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessProtected());
        return await { status: 'protected', success: true, message: 'Operation was successfully executed.', state: this.dataRequestStateController.getCurrentState(), response: response };
    }

    /**
     * Executed when data access is provided.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The responses of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceProvided(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessProvided());
        return await this.dataRequestStateController.broadcastOperationExecuted(crudOperation, response);
    }

    /**
     * Executed when data access is not available.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async ressourceNotAvailable(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getRessourceAccessNotAvailable());
        return await this.dataRequestStateController.cancelBroadcastOperation(crudOperation, response);
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessProtected extends State {

    /**
     * Constructor for the RessourceAccessProtected State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Once the ressource access is protected a request for data access can be initiated.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @return {Promise<Object>} The result of the request.
     */
    async requestRessourceAccess(crudOperation) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getAwaitBroadcastResponse());

        const _this = this;
        const response = await this.dataAccessController.requestAccessPermission(crudOperation);
        if (response.res.status === 'protected') {
            return await _this.dataRequestStateController.ressourceProtected(crudOperation, response);
        } else if (response.res.status === 'provided') {
            return await _this.dataRequestStateController.ressourceProvided(crudOperation, response);
        } else {
            return await _this.dataRequestStateController.ressourceNotAvailable(crudOperation, response);
        }
    }

    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response = null) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return await { status: 'failed', success: true, message: 'Operation was successfully executed.', state: this.dataRequestStateController.getCurrentState(), response: response };
    }

    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessProvided extends State {

    /**
     * Constructor for the RessourceAccessProvided State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Executes the broadcast CRUD operation as defined in the parameters of the crudOperation object.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async broadcastOperationExecuted(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return { status: 'provided', success: true, message: 'Operation was successfully executed.', state: this.dataRequestStateController.getCurrentState(), response: response };
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

/**
 * @class
 */
class RessourceAccessNotAvailable extends State {

    /**
     * Constructor for the RessourceAccessNotAvailable State.
     * @param {DataRequestStateController} dataRequestStateController: The managing data request state controller.
     * @param {DataAccessController} dataAccessController: The operational data access controller.
     */
    constructor(dataRequestStateController, dataAccessController) {
        super(dataRequestStateController);
        this.dataAccessController = dataAccessController;
    }

    /**
     * Cancels the remote CRUD operation.
     * @param {CRUDOperation} crudOperation: The operation to be executed.
     * @param {Object} response: The response of the target peers.
     * @return {Promise<Object>} The result of the request.
     */
    async cancelBroadcastOperation(crudOperation, response) {
        this.dataRequestStateController.setCurrentState(this.dataRequestStateController.getIdle());
        return await { status: 'failed', success: true, message: 'Operation was successfully executed.', state: this.dataRequestStateController.getCurrentState(), response: response };
    }

    /**
     * Returns the name of the state.
     * @return {String} The constructor's name.
     */
    toString() {
        return this.constructor.name;
    }
}

module.exports.DataRequestStateController = DataRequestStateController;
module.exports.State = State;

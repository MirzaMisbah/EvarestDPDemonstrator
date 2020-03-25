const model = require('../model');

/**
 * State Machine for smart service executions using minion states.
 * @class MinionStateController
 */
class MinionStateController {

    /**
     * Creates a new MinionStateController with all required states and transitions.
     * @param {SmartServiceController} smartServiceController: Instance of the running smart service controller.
     */
    constructor(smartServiceController) {
        this.smartServiceController = smartServiceController;
        this.idle = new Idle(this);
        this.smartServiceConfigurationsFound = new SmartServiceConfigurationsFound(this);
        this.smartServiceConfigurationLoaded = new SmartServiceConfigurationLoaded(this);
        this.minionMatchingChecked = new MinionMatchingChecked(this);
        this.executionFailed = new ExecutionFailed(this);
        this.executionProtected = new ExecutionProtected(this);
        this.executionPossible = new ExecutionPossible(this);
        this.minionsBound = new MinionsBound(this);
        this.smartServiceRunning = new SmartServiceRunning(this);

        this.currentState = this.idle;
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.currentState.getSmartServiceConfigurationItemIds();
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        return this.currentState.deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds);
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        return await this.currentState.loadSmartServiceConfiguration(smartServiceConfigurationItemId);
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        return await this.currentState.checkMinionMatching(smartServiceConfigurationItem);
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        return this.currentState.someMinionNotAvailable(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        return this.currentState.someMinionProtected(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async allMinionsAvailable(smartServiceConfigurationItem, response) {
        return await this.currentState.allMinionsAvailable(smartServiceConfigurationItem, response);
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        return await this.currentState.removeProtection(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async bindMinions(smartServiceConfigurationItem, response) {
        return await this.currentState.bindMinions(smartServiceConfigurationItem, response, this.terminateSmartService.bind(this));
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        return await this.currentState.runSmartService();
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        return this.currentState.terminateSmartService();
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        return this.currentState.cancel(smartServiceConfigurationItem, response);
    }

    /**
     * Sets the current state of the state machine according to a transition.
     * @param {MinionState} newState: The new state of the state machine.
     */
    setCurrentState(newState) {
        this.currentState = newState;
    }

    /**
     * Get the current state of the state machine.
     * @return {MinionState} The current state of the state machine
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get Idle state.
     * @return {Idle} The Idle state.
     */
    getIdle() {
        return this.idle;
    }

    /**
     * Get SmartServiceConfigurationsFound state.
     * @return {SmartServiceConfigurationsFound} The SmartServiceConfigurationsFound state.
     */
    getSmartServiceConfigurationsFound() {
        return this.smartServiceConfigurationsFound;
    }

    /**
     * Get SmartServiceConfigurationLoaded state.
     * @return {SmartServiceConfigurationLoaded} The SmartServiceConfigurationLoaded state.
     */
    getSmartServiceConfigurationLoaded() {
        return this.smartServiceConfigurationLoaded;
    }

    /**
     * Get MinionMatchingChecked state.
     * @return {MinionMatchingChecked} The MinionMatchingChecked state.
     */
    getMinionMatchingChecked() {
        return this.minionMatchingChecked;
    }

    /**
     * Get ExecutionFailed state.
     * @return {ExecutionFailed} The ExecutionFailed state.
     */
    getExecutionFailed() {
        return this.executionFailed;
    }

    /**
     * Get ExecutionProtected state.
     * @return {ExecutionProtected} The ExecutionProtected state.
     */
    getExecutionProtected() {
        return this.executionProtected;
    }

    /**
     * Get ExecutionPossible state.
     * @return {ExecutionPossible} The ExecutionPossible state.
     */
    getExecutionPossible() {
        return this.executionPossible;
    }

    /**
     * Get MinionsBound state.
     * @return {MinionsBound} The MinionsBound state.
     */
    getMinionsBound() {
        return this.minionsBound;
    }

    /**
     * Get SmartServiceRunning state.
     * @return {SmartServiceRunning} The SmartServiceRunning state.
     */
    getSmartServiceRunning() {
        return this.smartServiceRunning
    }

    /**
     * Get the SmartServiceController of the state machine.
     * @return {SmartServiceController} The SmartServiceController.
     * @private
     */
    _getSmartServiceController() {
        return this.smartServiceController;
    }
}


/**
 * Abstract parent class for all necessary minion states.
 * @class
 */
class MinionState {

    /**
     * Creates a new Minion State given the MinionStateController.
     * @param {MinionStateController} minionStateController: The minion controlling state machine.
     */
    constructor(minionStateController) {
        if (new.target === MinionState) {
            throw new TypeError('Abstract classes cannot be instantiated.')
        }
        Object.defineProperty(this, 'minionStateController', {
            get: function () {
                return minionStateController;
            }
        });
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async allMinionsAvailable(smartServiceConfigurationItem, response) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async bindMinions(smartServiceConfigurationItem, response) {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        return await {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        return {
            status: 'failed',
            success: false,
            message: 'This operation is not executable in the current state.',
            state: this.minionStateController.getCurrentState()
        }
    }

}

/**
 * @class
 */
class Idle extends MinionState {
    /**
     * Creates a new Idle state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Initiates a request for all ids of available smart service configuration items.
     * @return {Promise<Object>} The result of the call.
     */
    async getSmartServiceConfigurationItemIds() {
        const smartServiceConfigurationItemIds = await this.minionStateController._getSmartServiceController().getSmartServiceConfigurationItemIds();
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceConfigurationsFound());
        return this.minionStateController.deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds);
    }

    /**
     * Loads a specific smart service configuration into the system given its id.
     * @param {String} smartServiceConfigurationItemId: The id of the smart service configuration item to be loaded.
     * @return {Object} The result of the call.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        const response = await this.minionStateController._getSmartServiceController().loadSmartServiceConfiguration(smartServiceConfigurationItemId);
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceConfigurationLoaded());
        return await this.minionStateController.checkMinionMatching(model.SmartServiceConfigurationItem.fromJSON(response.response.res));
    }
}

/**
 * @class
 */
class SmartServiceConfigurationsFound extends MinionState {

    /**
     * Creates a new SmartServiceConfigurationsFound state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Delivers all ids of available smart service configuration items back to the caller.
     * @return {Object} The result of the call.
     */
    deliverSmartServiceConfigurationItemIds(smartServiceConfigurationItemIds) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItemIds: smartServiceConfigurationItemIds,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class SmartServiceConfigurationLoaded extends MinionState {

    /**
     * Creates a new SmartServiceConfigurationLoaded state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Checks availability of all minions necessary for service execution fiŕst local, then broadcast.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @return {Object} The result of the call.
     */
    async checkMinionMatching(smartServiceConfigurationItem) {
        const matchingResponse = await this.minionStateController._getSmartServiceController().match(smartServiceConfigurationItem);
        this.minionStateController.setCurrentState(this.minionStateController.getMinionMatchingChecked());
        for (let softwareItem of matchingResponse) {
            if (softwareItem.status === model.RESPONSE_STATUS.NOT_AVAILABLE) {
                return this.minionStateController.someMinionNotAvailable(smartServiceConfigurationItem, matchingResponse);
            }
            if (softwareItem.status === model.RESPONSE_STATUS.PROTECTED) {
                return this.minionStateController.someMinionProtected(smartServiceConfigurationItem, matchingResponse);
            }
        }
        return await this.minionStateController.allMinionsAvailable(smartServiceConfigurationItem, matchingResponse);
    }
}

/**
 * @class
 */
class MinionMatchingChecked extends MinionState {

    /**
     * Creates a new MinionMatchingChecked state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Gets executed if some minion is not available for the service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionNotAvailable(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionFailed());
        return this.minionStateController.cancel(smartServiceConfigurationItem, response);
    }

    /**
     * Gets executed if some minion is a protected ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    someMinionProtected(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionProtected());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }

    /**
     * Gets executed if all minions are available for service execution.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async allMinionsAvailable(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getExecutionPossible());
        return await this.minionStateController.bindMinions(smartServiceConfigurationItem, response);
    }
}

/**
 * @class
 */
class ExecutionFailed extends MinionState {

    /**
     * Creates a new ExecutionFailed state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class ExecutionProtected extends MinionState {

    /**
     * Creates a new ExecutionProtected state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Initiates mechanism in order to remove the protection of some requested ressource.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Promise<Object>} The result of the call.
     */
    async removeProtection(smartServiceConfigurationItem, response) {
        //TODO Implement Method with concrete business logic. At the moment it just cancels the execution.
        const matchingResponse = await this.minionStateController._getSmartServiceController().removeProtections(response);

        return this.cancel(smartServiceConfigurationItem, response);

        // Something like this will be the case once there is a concrete business logic behind the execution:
        /*
            const matchingResponse = await this.minionStateController._getSmartServiceController().removeProtections(response);
            this.minionStateController.setCurrentState(this.minionStateController.getExecutionPossible());
            return await this.minionStateController.bindMinions(smartServiceConfigurationItem, matchingResponse)
         */

    }

    /**
     * Cancels the operation and returns back to Idle State.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    cancel(smartServiceConfigurationItem, response) {
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());
        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class ExecutionPossible extends MinionState {

    /**
     * Creates a new ExecutionPossible state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Gets executed in order to bind all minions w.r.t. the service configuration within the smart sertvice controller.
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying smart service configuration.
     * @param {Array} response: The result of the minion matching call
     * @return {Object} The result of the call.
     */
    async bindMinions(smartServiceConfigurationItem, response, terminateCallback) {
        await this.minionStateController._getSmartServiceController().bindMinions(smartServiceConfigurationItem, response, terminateCallback);
        this.minionStateController.setCurrentState(this.minionStateController.getMinionsBound());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            smartServiceConfigurationItem: smartServiceConfigurationItem,
            matchingResponse: response,
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class MinionsBound extends MinionState {

    /**
     * Creates a new MinionsBound state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Runs the smart service according to the smart service configuration once all minions are loaded and bound.
     * @return {Promise<Object>} The result of the call.
     */
    async runSmartService() {
        await this.minionStateController._getSmartServiceController().activateLoadedService();
        this.minionStateController.setCurrentState(this.minionStateController.getSmartServiceRunning());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            state: this.minionStateController.getCurrentState()
        };
    }
}

/**
 * @class
 */
class SmartServiceRunning extends MinionState {

    /**
     * Creates a new SmartServiceRunning state.
     * @param {MinionStateController} minionStateController: The underlying minion state controller.
     */
    constructor(minionStateController) {
        super(minionStateController);
    }

    /**
     * Terminates the running smart service once started.
     * @return {Promise<Object>} The result of the call.
     */
    terminateSmartService() {
        this.minionStateController._getSmartServiceController().terminateRunningService();
        this.minionStateController.setCurrentState(this.minionStateController.getIdle());

        return {
            status: 'success',
            success: true,
            message: 'Operation was successfully executed.',
            state: this.minionStateController.getCurrentState()
        };
    }
}

module.exports.MinionState = MinionState;
module.exports.MinionsBound = MinionsBound;
module.exports.MinionStateController = MinionStateController;
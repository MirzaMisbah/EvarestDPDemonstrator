const MinionController = require('./minioncontroller').MinionController;
const DataAccessService = require('../dataallocation/dataaccessservice').DataAccessService;
const model = require('../model');

/**
 * Provides functionality for a smart service execution including loading, matching, binding and execution phases.
 * @class
 */
class SmartServiceController {

    /**
     * Creates a new SmartServiceController that controlls the smart service execution according to its configuration.
     * @param {DataAccessService} dataAccessService: The data access service of the system in orde rto communicate with the data and software allocation.
     * @param {uiAdapter} uiAdapter: The UI adapter giving access to manipulate the UI.
     */
    constructor(dataAccessService, uiAdapter) {
        this.dataAccessService = dataAccessService;
        this.uiAdapter = uiAdapter;
        this.minionController = new MinionController(this.dataAccessService, uiAdapter);
    }

    /**
     * Get a specific smart service configuration item given its id.
     * @param {String} smartServiceConfigurationItemId: The smart service configuration item id.
     * @return {Promise<SmartServiceConfigurationItem>} The result of the request.
     */
    async loadSmartServiceConfiguration(smartServiceConfigurationItemId) {
        const query = new model.DatabaseQuery(model.QUERY_TYPE.STATIC, smartServiceConfigurationItemId, []);
        const crudOperation = new model.CRUDOperation(model.CRUD_OPERATION_TYPE.READ, model.OBJECT_TYPE.SMART_SERVICE, null, query);
        return await this.dataAccessService.requestCRUDOperation(crudOperation);
    }

    /**
     * Provides the (crucial) functionality that is necessary for finding and matching the smart services components i.e. minions. (crucial functionality)
     * @param {SmartServiceConfigurationItem} smartServiceConfigurationItem: The underlying configuration item of the smart service.
     * @return {Promise<Array>} The response of the minions found and matched (either available, protected or not available).
     */
    async match(smartServiceConfigurationItem) {
        // This method should match all necessary minions first within the local database and afterwards with a broadcast operation for the minions that weren'd available locally.

        // Check all minions that are locally available.
        const locallyAvailable = [];
        const locallyNotAvailable = [];
        for (let i = 0; i < smartServiceConfigurationItem.getConfiguration().length; i++) {
           try {
               let result = await this._matchLocalMinions(smartServiceConfigurationItem.getConfiguration()[i]);
               if (result.success && result.response.res) {
                   result.response = model.SoftwareItem.fromJSON(result.response.res);
                   locallyAvailable.push(result);
               } else {
                   locallyNotAvailable.push(smartServiceConfigurationItem.getConfiguration()[i]);
               }
           } catch (Error) {
                locallyNotAvailable.push(smartServiceConfigurationItem.getConfiguration()[i]);
            }
        }
        // Broadcast for all minions that are not locally available.
        const result = locallyAvailable;
        for (let i = 0; i < locallyNotAvailable.length; i++) {
            let request = await this._matchBroadcastMinions(locallyNotAvailable[i]);
            if (request.success && request.state === this.dataAccessService.getDataRequestStateController().getIdle()) {
                request.response = request.response[0].res.response;
                let crudOperation = new model.CRUDOperation(model.CRUD_OPERATION_TYPE.CREATE, model.OBJECT_TYPE.SOFTWARE, request.response, null, null);
                await this.dataAccessService.requestCRUDOperation(crudOperation);
            }
            result.push(request);
        }
        return result;
    }

    async _matchLocalMinions(minionSpecification, numberOfRetries = 0) {
        // Creates a local CRUDOperation first. NOTE: This just queries on the id of the minions, but mot on something like a minimal version of a minion.
        const _this = this;
        let crudOperation = new model.CRUDOperation(model.CRUD_OPERATION_TYPE.READ, model.OBJECT_TYPE.SOFTWARE, null, new model.DatabaseQuery(model.QUERY_TYPE.STATIC, minionSpecification.getSoftwareItemId(), null), null);
        let result = await this.dataAccessService.requestCRUDOperation(crudOperation);
        if (result.success) {
            return result;
        } else {
            if (numberOfRetries < 3) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(_this._matchLocalMinions(minionSpecification, numberOfRetries++));
                    }, 500);
                })
            } else {
                return result;
            }
        }
    }

    async _matchBroadcastMinions(minionSpecification, numberOfRetries = 0) {
        // Creates a local CRUDOperation first. NOTE: This just queries on the id of the minions, but mot on something like a minimal version of a minion.
        const _this = this;
        let crudOperation = new model.CRUDOperation(model.CRUD_OPERATION_TYPE.READ, model.OBJECT_TYPE.SOFTWARE, null, new model.DatabaseQuery(model.QUERY_TYPE.STATIC, minionSpecification.getSoftwareItemId(), null), new model.BroadcastConfiguration(this.dataAccessService.getLocalID(), [minionSpecification.getSoftwareItemId()], model.BROADCAST_TYPE.BAAS, model.BROADCAST_CONDITION.ANY, null));
        let result = await this.dataAccessService.requestCRUDOperation(crudOperation);
        if (result.success) {
            if (result.state === this.dataAccessService.getDataRequestStateController().getRessourceAccessProtected()) {
                // TODO Cancel for now
                result = await this.dataAccessService.cancelBroadcastOperation(crudOperation);
            }
            return result;
        } else {
            if (numberOfRetries < 3) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(_this._matchLocalMinions(minionSpecification, numberOfRetries++));
                    }, 500);
                })
            } else {
                return result;
            }
        }
    }

    /**
     * Binds all minions within the minion controller with their specified transitions in order to make the service executable. (crucial functionality)
     * @param {SmartServiceConfigurationItem} smartServiceConfiguration: The underlying configuration item of the smart service.
     * @param {Array} matchingResult: The result of the minion matching phase including the loaded software components.
     */
    async bindMinions(smartServiceConfiguration, matchingResult, terminateCallback) {
        // This method should make use of the minion controller to bind the matched minions in the specified way.
        this.minionController.clearRuntimeEnvironment();
        const minionSpecifications = smartServiceConfiguration.getConfiguration();
        this.minionController.register(matchingResult.map(res => res.response));
        this.minionController.bind(smartServiceConfiguration.getConfiguration());
        try {
            this.uiAdapter.showService(smartServiceConfiguration, terminateCallback);
        } catch (e) {
            console.warn('catched: ' + e);
        }
    }

    /**
     * Activates the service once loaded all necessary minions within the minion controller.
     * @return {Promise<void>}
     */
    async activateLoadedService() {
        await this.minionController.activate();
    }

    /**
     * Terminates the running smart service once activated.
     */
    terminateRunningService() {
        this.minionController.terminate();
        this.minionController.clearRuntimeEnvironment();
    }

    /**
     * Get all ids of available smart service configuration items within the local db.
     * @return {Promise<Array<String>>} List of smart service configuration items.
     */
    async getSmartServiceConfigurationItemIds() {
        return await this.dataAccessService.getSmartServiceConfigurationItemIds();
    }



    /**
     * Remove the protection of all protected minions within the matching result according to its protection rule. (crucial functionality)
     * @param {Array} matchingResult: The result of the initial matching.
     * @return {Promise<Array>} The result of the initial matching result together with the minions made available by removing its protection.
     */
    async removeProtections(matchingResult) {
        console.warn('Method needs to be implemented first!');
        // TODO: This method should work with some transactional mechanism to remove protections from software items by third party.
    }

    /**
     * Get the minion controller used in the system.
     * @return {MinionController} The MinionController Object.
     */
    getMinionController() {
        return this.minionController;
    }

    /**
     * Get the data access service used for data allocation.
     * @return {DataAccessService} The DataAccessService Object.
     */
    getDataAccessService() {
        return this.dataAccessService;
    }

    /**
     * Notifies all minions for new data arrival.
     * @param {Minion | null} source: The source of notification. If null, all PMINs will get informed.
     * @param {DomainItem} dataItem: The new DomainItem.
     */
    notifyMinions (source, dataItem) {
        this.minionController.notify(source, dataItem);
    }
}

module.exports.SmartServiceController = SmartServiceController;
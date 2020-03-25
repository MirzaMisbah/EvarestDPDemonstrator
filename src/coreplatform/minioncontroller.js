const minion = require('./minion');

/**
 * Controller of the minion infrastructure.
 * @class
 */
class MinionController {

    /**
     * Constructor of a minion controller.
     * @param {DataAccessService} dataAccessService: The data access service object.
     * @param {} uiAdapter: The UI adapter giving access to manipulate the UI.
     */
    constructor(dataAccessService, uiAdapter) {
        this.minionMap = new MinionCommunicationMap();
        this.counter = 0;
        this.minionClasses = {};
        this.minionInstances = {};

        this.dataAccessService = dataAccessService;
        this.uiAdapter = uiAdapter;
    }

    /**
     * Registers a set of software items within the local workspace.
     * @param {Array<SoftwareItem>}softwareItems
     */
    register(softwareItems) {
        for (let i = 0; i < softwareItems.length; i++) {
            this._addMinionClass(softwareItems[i].getId(), softwareItems[i].getClass());
        }
    }

    /**
     * Bind minions to a smart service configuration
     * @param {Array<MinionSpecification>} minionSpecifications: List of minion specifications.
     */
    bind(minionSpecifications) {
        for (let minionSpecification of minionSpecifications) {
            if (!minionSpecification.getInstanceId())
                minionSpecification.setInstanceId(0);
            this._initialize(minionSpecification);

        }
        for (let minionSpecification of minionSpecifications) {
            if (minionSpecification.getTargetMinionIds()) {
                const sourceId = minionSpecification.getInstanceId();
                for (let targetId of minionSpecification.getTargetMinionIds()) {
                    this._addTransition(sourceId, targetId);
                }
            }
        }
    }

    /**
     * Activate all minions that are already bound.
     */
    async activate() {
        for (let minionInstanceId of Object.keys(this.minionInstances)) {
            try {
                await this.minionInstances[minionInstanceId].activate();
            } catch (e) {
                console.warn(e);
            }
        }
    }

    /**
     * Terminate running minions.
     */
    terminate() {
        for (let minionInstanceId of Object.keys(this.minionInstances)) {
            this.minionInstances[minionInstanceId].terminate();
        }
    }

    /**
     * Clear the whole runtime environment i.e. transitions and instances.
     */
    clearRuntimeEnvironment() {
        this.terminate();
        this.minionMap = new MinionCommunicationMap();
        this.minionInstances = {};
    }

    /**
     * Submit new data into the minion network.
     * @param {Minion} sourceId: The source of the data.
     * @param {*} dataItem: The data to be forwarded.
     */
    notify(sourceMinion, dataItem) {
        //console.log(dataItem);
        if (sourceMinion) {
            const targets = this.minionMap.getTargetMinionIDs(sourceMinion.getInstanceId());
            for (let target of targets) {
                this.minionInstances[target].notify(dataItem);
            }
        } else {
            // Data from other T-ENV; Notify PMINs
            for (let instanceId of Object.keys(this.minionInstances)) {
                if (this.minionInstances[instanceId] instanceof minion.Pmin) {
                    this.minionInstances[instanceId].notify(dataItem);

                }
            }
        }


    }

    /**
     * Get the minion classes loaded from disk.
     * @return {Object} The minion classes that are currently available.
     */
    getMinionClasses() {
        return this.minionClasses;
    }

    /**
     * Get a particular class for a minion id.
     * @param {String} minionId: The minion id.
     * @return {Class} The minion class.
     */
    getMinionClass(minionId) {
        return this.minionClasses[minionId];
    }

    /**
     * initializes a new minion based on its specification object.
     * @param {MinionSpecification} minionSpecification: The minion specification object.
     * @private
     */
    async _initialize(minionSpecification) {
        const uiMinion = (new this.minionClasses[minionSpecification.getSoftwareItemId()]()) instanceof minion.VisualizationCmin;
        let min = null;
        if (uiMinion) {
            min = new this.minionClasses[minionSpecification.getSoftwareItemId()](this.dataAccessService, this, minionSpecification.getSoftwareItemId(), this.uiAdapter);
        } else {
            min = new this.minionClasses[minionSpecification.getSoftwareItemId()](this.dataAccessService, this, minionSpecification.getSoftwareItemId(), this.uiAdapter);
        }
        this._addMinionInstance(minionSpecification, min);
        this.minionMap.addMinion(min.getInstanceId());
    }

    /**
     * Add a new minion class to the network.
     * @param {String} id: The id of the minion class i.e. the id of the software item.
     * @param {Class} minionClass: The minion class to be added.
     * @private
     */
    _addMinionClass(id, minionClass) {
        if (!(Object.keys(this.minionClasses).includes(id))) {
            this.minionClasses[id] = minionClass;
        }
    }

    /**
     * Add a new minion instance to the network.
     * @param {MinionSpecification} minionSpecification: The minion specification.
     * @param {Minion} min: The minion to be added.
     * @private
     */
    _addMinionInstance(minionSpecification, min) {
        const minionInstanceId = minionSpecification.getInstanceId();
        if (this.minionInstances[minionInstanceId]) {
            throw Error('Bind Error: Minion instance duplicate.')
        } else {
            min.setInstanceId(minionInstanceId);
            this.minionInstances[minionInstanceId] = min;
        }
    }

    /**
     * Add a new transition between two minion instances within the communication network.
     * @param {String} sourceMinionId: The id of the source minion.
     * @param {String} targetMinionId: The id of the target minion.
     * @private
     */
    _addTransition(sourceMinionId, targetMinionId) {
        console.log('source' + sourceMinionId);
        console.log('target' + targetMinionId);
        if (targetMinionId === "") {
            return;
        }
        if ((this.minionInstances[sourceMinionId]) && (this.minionInstances[targetMinionId]))
            this.minionMap.addTransition(sourceMinionId, targetMinionId);
        else
            throw Error('Transition Error: Source and/or Target not available.');
    }
}

/**
 * Transition map of all minion instances.
 * @class
 */
class MinionCommunicationMap {

    /**
     * Create an empty transition map.
     */
    constructor() {
        this.columnRows = [];
        this.map = [];
    }

    /**
     * Get all targets of a specified minion instance id.
     * @param {String} minionInstanceId: The minion instance id.
     * @return {Array} The target minion instance ids.
     */
    getTargetMinionIDs(minionInstanceId) {
        const resultIDs = [];
        const index = this.columnRows.indexOf(minionInstanceId);
        for (let i = 0; i < this.map[index].length; i++) {
            if (this.map[index][i] === 1) {
                resultIDs.push(this.columnRows[i]);
            }
        }
        return resultIDs;
    }

    /**
     * Get all sources of a specified minion instance id.
     * @param {String} minionInstanceId: The minion instance id.
     * @return {Array} The source minion instance ids.
     */
    getSourceMinionIDs(minionInstanceId) {
        const resultIDs = [];
        const index = this.columnRows.indexOf(minionInstanceId);
        for (let i = 0; i < this.map.length; i++) {
            if (this.map[i][index] === 1) {
                resultIDs.push(this.columnRows[i]);
            }
        }
        return resultIDs;
    }

    /**
     * Add a new minion to the map.
     * @param {String} minionInstanceId: The minion instance id of the new minion.
     */
    addMinion(minionInstanceId) {
        this.columnRows.push(minionInstanceId);
        for (let row of this.map) {
            row.push(0);
        }
        const newRow = [];
        for (let i = 0; i < this.columnRows.length; i++) {
            newRow.push(0);
        }
        this.map.push(newRow)
    }

    /**
     * Add a new transition between two minion instances.
     * @param {String} sourceMinionInstanceId: The id of the source minion instance.
     * @param {String} targetMinionInstanceId: The id of the target minion instance.
     */
    addTransition(sourceMinionInstanceId, targetMinionInstanceId) {
        const sourceIndex = this.columnRows.indexOf(sourceMinionInstanceId);
        const targetIndex = this.columnRows.indexOf(targetMinionInstanceId);
        this.map[sourceIndex][targetIndex] = 1;
    }

    /**
     * Removes an existing transition between two minion instances.
     * @param {String} sourceMinionInstanceId: The id of the source minion instance.
     * @param {String} targetMinionInstanceId: The id of the target minion instance.
     */
    removeTransition(sourceMinionInstanceId, targetMinionInstanceId) {
        const sourceIndex = this.columnRows.indexOf(sourceMinionInstanceId);
        const targetIndex = this.columnRows.indexOf(targetMinionInstanceId);
        this.map[sourceIndex][targetIndex] = 0;
    }

    /**
     * Return the whole transition map.
     * @return {Array<Array<Number>>} The transition map
     */
    getMap() {
        return this.map;
    }

    /**
     * Returns the column names i.e. minion instance ids of the transition map.
     * @return {Array<String>} The column names.
     */
    getColumnRows() {
        return this.columnRows;
    }
}

module.exports.MinionCommunicationMap = MinionCommunicationMap;
module.exports.MinionController = MinionController;

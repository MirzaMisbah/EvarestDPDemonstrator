const CRUD_OPERATION_TYPE = require('../../model').CRUD_OPERATION_TYPE;
const OBJECT_TYPE = require('../../model').OBJECT_TYPE;

/**
 * @interface
 */
class DatabaseHandler {

    /**
     * Interface for classes that represent a DatabaseHandler Adapter.
     */
	constructor() {
		if(new.target===DatabaseHandler){
            throw new Error('Interfaces cannot be instantiated.');
        }

	}

    /**
	 * Given a well definded CRUDOperation this function executes the right function.
     * @param crudOperation: The operation to be executed.
     * @returns {Promise<boolean|Array>}
     */
	async executeLocalCRUDOperation(crudOperation)	{
		switch (crudOperation.getOperationType()) {
			case CRUD_OPERATION_TYPE.CREATE:
				return await this.create(crudOperation.getObject(), crudOperation.getObjectType());
				break;
			case CRUD_OPERATION_TYPE.READ:
                return await this.read(crudOperation.getQuery(), crudOperation.getObjectType());
				break;
			case CRUD_OPERATION_TYPE.UPDATE:
                return await this.update(crudOperation.getQuery(), crudOperation.getObject(), crudOperation.getObjectType());
				break;
			case CRUD_OPERATION_TYPE.DELETE:
                return await this.delete(crudOperation.getQuery(), crudOperation.getObjectType());
        }
	}

    /**
	 * Creates an object in the local database
     * @param object: The object to create.
	 * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
	async create(object, objectType) {
		switch (objectType) {
			case OBJECT_TYPE.DATA:
				return await this._createData(object);
				break;
			case OBJECT_TYPE.SOFTWARE:
				return await this._createSoftwareComponent(object);
				break;
			case OBJECT_TYPE.MODEL:
				return await this._createModel(object);
				break;
            case OBJECT_TYPE.SMART_SERVICE:
                return await this._createSmartServiceConfiguration(object);
                break;
		}
	}

    /**
     * Reads an object from the local database.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<Array>} Array of objects.
     */
    async read(query, objectType) {
        switch (objectType) {
            case OBJECT_TYPE.DATA:
                return await this._readData(query);
                break;
            case OBJECT_TYPE.SOFTWARE:
                return await this._readSoftwareComponent(query);
                break;
            case OBJECT_TYPE.MODEL:
                return await this._readModel(query);
                break;
            case OBJECT_TYPE.SMART_SERVICE:
                return await this._readSmartServiceConfiguration(query);
                break;
        }
    }

    /**
     * Updates an object and replaces it with a new one.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The new object.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
    async update(query, object, objectType) {
        switch (objectType) {
            case OBJECT_TYPE.DATA:
                return await this._updateData(query, object);
                break;
            case OBJECT_TYPE.SOFTWARE:
                return await this._updateSoftwareComponent(query, object);
                break;
            case OBJECT_TYPE.MODEL:
                return await this._updateModel(query, object);
                break;
            case OBJECT_TYPE.SMART_SERVICE:
                return await this._updateSmartServiceConfiguration(query, object);
                break;
        }
    }

    /**
     * Deletes an object
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param objectType: The type of the object i.e. data, software or model.
     * @returns {Promise<boolean>} Success or not.
     */
    async delete(query, objectType) {
        switch (objectType) {
            case OBJECT_TYPE.DATA:
                return await this._deleteData(query);
                break;
            case OBJECT_TYPE.SOFTWARE:
                return await this._deleteSoftwareComponent(query);
                break;
            case OBJECT_TYPE.MODEL:
                return await this._deleteModel(query);
                break;
            case OBJECT_TYPE.SMART_SERVICE:
                return await this._deleteSmartServiceConfiguration(query);
                break;
        }
    }

    /**
     * Returns all cached domain item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored domain items.
     */
    async getDomainItemIDs() {
        throw new Error('You have to implement the method getDomainItemIDs');
    }

    /**
     * Returns all cached software item names accessible withing the database.
     * @return {Promise<Array>} The names of the cached software items.
     */
    async getSoftwareItemIDs() {
        throw new Error('You have to implement the method getSoftwareItemIDs');
    }

    /**
     * Returns all cached model item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored model items.
     */
    async getModelItemIDs() {
        throw new Error('You have to implement the method getModelItemIDs');
    }

    /**
     * Returns all cached Smart Service Configuration Item IDs accessible withing the database.
     * @return {Promise<Array>} The IDs of the stored Smart Service Configuration Items.
     */
    async getSmartServiceConfigurationItemIDs() {
        throw new Error('You have to implement the method getSmartServiceConfigurationItemIDs');
    }

    /**
	 * Creates a new data object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
	async _createData(object) {
        throw new Error('You have to implement the method _createData!');
    }

    /**
     * Creates a new software component object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSoftwareComponent(object) {
        throw new Error('You have to implement the method _createSoftwareComponent!');
    }

    /**
     * Creates a new model object.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createModel(object) {
        throw new Error('You have to implement the method _createModel!');
    }

    /**
     * Creates a new smart service configuration item.
     * @param object: The object to create.
     * @return {Promise<boolean>} Success or not
     */
    async _createSmartServiceConfiguration(object) {
        throw new Error('You have to implement the method _createSmartServiceConfiguration!');
    }

    /**
     * Reads a new data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readData(query) {
        throw new Error('You have to implement the method _readData!');
    }

    /**
     * Reads a new software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSoftwareComponent(query) {
        throw new Error('You have to implement the method _readSoftwareComponent!');
    }

    /**
     * Reads a new model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readModel(query) {
        throw new Error('You have to implement the method _readModel!');
    }

    /**
     * Reads a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @returns {Promise<Array>} Array of objects.
     */
    async _readSmartServiceConfiguration(query) {
        throw new Error('You have to implement the method _readSmartServiceConfiguration!');
    }

    /**
     * Updates a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateData(query, object) {
        throw new Error('You have to implement the method _updateData!');
    }

    /**
     * Updates a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSoftwareComponent(query, object) {
        throw new Error('You have to implement the method _updateSoftwareComponent!');
    }

    /**
     * Updates a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateModel(query, object) {
        throw new Error('You have to implement the method _updateModel!');
    }

    /**
     * Updates a new smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @param object: The object to be updated.
     * @return {Promise<boolean>} Success or not
     */
    async _updateSmartServiceConfiguration(query, object) {
        throw new Error('You have to implement the method _updateSmartServiceConfiguration!');
    }

    /**
     * Deletes a data object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteData(query) {
        throw new Error('You have to implement the method _deleteData!');
    }

    /**
     * Deletes a software component object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSoftwareComponent(query) {
        throw new Error('You have to implement the method _deleteSoftwareComponent!');
    }

    /**
     * Deletes a model object.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteModel(query) {
        throw new Error('You have to implement the method _deleteModel!');
    }

    /**
     * Deletes a smart service configuration item.
     * @param query: DatabaseQuery defining the query parameter e.g. id, type etc. of the data.
     * @return {Promise<boolean>} Success or not
     */
    async _deleteSmartServiceConfiguration(query) {
        throw new Error('You have to implement the method _deleteSmartServiceConfiguration!');
    }
}

module.exports.DatabaseHandler = DatabaseHandler;
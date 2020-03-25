// TODO: Add Comments + revise some descriptive models e.g. FeatureRequest and FeatureResponse and MinionSpecification

/**
 * Datatype of CRUD operations.
 * @type {{CREATE: string, READ: string, UPDATE: string, DELETE: string}}
 */
const CRUD_OPERATION_TYPE = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete'
};

/**
 * Datatype of objects.
 * @type {{DATA: string, SOFTWARE: string, MODEL: string}}
 */
const OBJECT_TYPE = {
    DATA: 'data',
    SOFTWARE: 'software',
    MODEL: 'model',
    SMART_SERVICE: 'smart_service'
};

/**
 * Different types of queries; streaming type means connection is kept alive and the request function gets notified whenever there is new data.
 * @type {{STATIC: string, STREAMING: string}}
 */
const QUERY_TYPE = {
    STATIC: 'static',
    STREAMING: 'streaming'
};

/**
 * Types of a remote request targeting a connected peer.
 * @type {{CRUD_OPERATION_TYPE: string, TRIGGER: string, CRUD_TRIGGER: string, CHECK_ACCESS: string, REQUEST_ACCESS: string}}
 * @deprecated
 */
const REQUEST_TYPE = {
    CRUD: 'crud',
    TRIGGER: 'trigger',
    CRUD_TRIGGER: 'crud_trigger',
    CHECK_ACCESS: 'check_access',
    REQUEST_ACCESS: 'request_access'
};

/**
 * Type of a broadcast request (upeer = p2p operation, baas = backend as a service request)
 * @type {{UPEER: string, BAAS: string}}
 */
const BROADCAST_TYPE = {
    UPEER: 'upeer',
    BAAS: 'baas'
};

/**
 * Condition whether the returning result will be accepted or not (all = all requests need to be successfull, any = at least one should be successfull)
 * @type {{ALL: string, ANY: string}}
 */
const BROADCAST_CONDITION = {
    ALL: 'all',
    ANY: 'any'
};

/**
 * Status of the source that was requested.
 * @type {{PROVIDED: string, PROTECTED: string, NOT_AVAILABLE: string}}
 */
const RESPONSE_STATUS = {
    NOT_AVAILABLE: 'not_available',
    PROTECTED: 'protected',
    PROVIDED: 'provided'
};

/**
 * The type of a minion.
 * @type {{CMIN: string, PMIN: string, TMIN: string}}
 */
const MINION_TYPE ={
    PMIN : 'P',
    TMIN : 'T',
    CMIN : 'C'
};

class CRUDOperation {
    /**
     * Creates a new CRUD_OPERATION_TYPE operation of certain type.
     * @param {CRUD_OPERATION_TYPE|string} operationType: The type of operation (create, read, update, delete)
     * @param {OBJECT_TYPE|string} objectType: The type of the object to operate on (data, software, model)
     * @param {DomainItem | SoftwareItem | SmartServiceConfigurationItem | ModelItem | null} object (optional): the object to be saved.
     * @param {DatabaseQuery|null} query (optional): The query for reading, updating and deletion of objects.
     * @param {BroadcastConfiguration|null} broadcastConfiguration (optional): The configuration of the remote operation.
     */
    constructor(operationType = CRUD_OPERATION_TYPE.CREATE, objectType = OBJECT_TYPE.DATA, object = null, query = null, broadcastConfiguration = null) {
        this.operationType = operationType;
        this.objectType = objectType;
        this.object = object;
        this.query = query;
        this.broadcastConfiguration = broadcastConfiguration;
    }

    /**
     * Transforms a CRUDOperation into JSON format e.g. for transferring it between peers.
     * @return {{query: (Object|null), operationType: (CRUD_OPERATION_TYPE|string), broadcastConfiguration: (Object|null), objectType: (OBJECT_TYPE|string), object: (Object|null)}}: The resulting JSON.
     */
    toJSON() {
        return {
            operationType: this.operationType,
            objectType: this.objectType,
            object: this.object ? this.object.toJSON() : null,
            query: this.query ? this.query.toJSON() : null,
            broadcastConfiguration: this.broadcastConfiguration ? this.broadcastConfiguration.toJSON() : null
        };
    }

    /**
     * Transfers a json object in the given schreme into a CRUDOperation object.
     * @throws Error if the json is not in the right format
     * @param {{query: (Object|null), operationType: (CRUD_OPERATION_TYPE|string), broadcastConfiguration: (Object|null), objectType: (OBJECT_TYPE|string), object: (Object|null)}} json: The operation as json object.
     * @return {CRUDOperation|null}: The CRUDOperation object.
     */
    static fromJSON(json) {
        if (json) {
            let object = null;
            if (json.object) {
                if (json.object.object) {
                    object = DomainItem.fromJSON(json.object);
                } else if (json.object.code) {
                    object = SoftwareItem.fromJSON(json.object);
                } else {
                    object = ModelItem.fromJSON(json.object);
                }
            }
            return new CRUDOperation(json.operationType, json.objectType, object, DatabaseQuery.fromJSON(json.query), BroadcastConfiguration.fromJSON(json.broadcastConfiguration));
        } else return null;
    }

    /**
     * Returns the operation type.
     * @returns {CRUD_OPERATION_TYPE|string}: The operation type.
     */
    getOperationType() {
        return this.operationType;
    }

    /**
     * Returns the object type.
     * @returns {OBJECT_TYPE|string}: The object type.
     */
    getObjectType() {
        return this.objectType;
    }

    /**
     * Returns the object.
     * @throws TypeError if no object is defined.
     * @returns {DomainItem | SoftwareItem | SmartServiceConfigurationItem | ModelItem}: The object of the CRUDOperation.
     */
    getObject() {
        if (this.object) {
            return this.object;
        } else {
            throw TypeError('Object is not defined.');
        }
    }

    /**
     * Returns the query object of the operation.
     * @throws TypeError if no query is defined.
     * @returns {DatabaseQuery}: The query of the CRUDOperation.
     */
    getQuery() {
        if (this.query) {
            return this.query;
        } else {
            throw TypeError('DatabaseQuery is not defined.');
        }
    }

    /**
     * Returns the broadcast configuration of the operation.
     * @throws TypeError if no remote configuration is defined.
     * @returns {BroadcastConfiguration}: The broadcast configuration of the CRUDOperation if present.
     */
    getBroadcastConfiguration() {
        if (this.broadcastConfiguration) {
            return this.broadcastConfiguration;
        } else {
            return null;
        }
    }

    /**
     * Returns the target of the broadcast operation.
     * @throws TypeError if no remote configuration is defined.
     * @returns {Array<string>}: The targets of the broadcast configuration.
     */
    getBroadcastTargets() {
        return this.getBroadcastConfiguration().getTargets();
    }

    /**
     * Sets the operation type.
     * @param {CRUD_OPERATION_TYPE|string} operationType: The type of operation
     */
    setOperationType(operationType) {
        this.operationType = operationType;
    }

    /**
     * Sets the object type.
     * @param {OBJECT_TYPE|string} objectType: The new object type.
     */
    setObjectType(objectType) {
        this.objectType = objectType;
    }

    /**
     * Sets the object.
     * @param {DomainItem|SoftwareItem|ModelItem|SmartServiceConfigurationItem} object: The new object to be set.
     */
    setObject(object) {
        this.object = object;
    }

    /**
     * Sets the query object of the operation.
     * @param {DatabaseQuery} query: The new query to be set.
     */
    setQuery(query) {
        this.query = query;
    }

    /**
     * Sets the remote configuration of the operation.
     * @param {BroadcastConfiguration} broadcastConfiguration: The new broadcast configuration to be set.
     */
    setBroadcastConfiguration(broadcastConfiguration) {
        this.broadcastConfiguration = broadcastConfiguration;
    }
}

class DatabaseQuery {

    /**
     * Creates a query for a read, update and/or delete CRUDOperation based on identifiying ressource string and query parameters.
     * @param {QUERY_TYPE|string} queryType: The type of the query i.e. whether it will be streaming or static operations.
     * @param {string} ressource: Identificator of the ressource i.e. domain, peer ID etc.
     * @param {Array<Object|null>} params: The parameter of the query.
     */
    constructor(queryType = QUERY_TYPE.STATIC, ressource, params) {
        this.queryType = queryType;
        this.ressource = ressource;
        this.params = params;
    }

    /**
     * Transforms a DatabaseQuery object to JSON.
     * @return {{ressource: string, params: Array<Object|null>, queryType: (QUERY_TYPE|string)}}: The resulting JSON.
     */
    toJSON() {
        return {
            queryType: this.queryType,
            ressource: this.ressource,
            params: this.params
        }
    }

    /**
     * Transforms a json object into DatabaseQuery.
     * @param {{ressource: string, params: Array<Object|null>, queryType: (QUERY_TYPE|string)}} json: The DatabaseQuery in JSON format.
     * @return {DatabaseQuery|null}: The DatabaseQuery object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new DatabaseQuery(json.queryType, json.ressource, json.params);
        } else {
            return null;
        }
    }

    /**
     * Get the type of query.
     * @return {QUERY_TYPE|string}: The query type.
     */
    getQueryType() {
        return this.queryType;
    }

    /**
     * Get the ressource i.e. id of the ressource to be requested.
     * @return {string}: The id of the ressource.
     */
    getRessource() {
        return this.ressource;
    }

    /**
     * Get the parameter of the query.
     * @return {Array<Object|null>}: The parameter of the query.
     */
    getParams() {
        return this.params;
    }

    /**
     * Transforms the query to URI i.e. concatenates all parameters as a query string.
     * @return {string}: The query as a URI with query string.
     */
    toURI() {
        let uri = this.ressource;
        if (this.params.length > 0) {
            uri += '?'
        }
        for (let i = 0; i < this.params.length; i++) {
            uri += this.params[i].name + '=' + this.params[i].value;
            if (i < (this.params.length - 1)) {
                uri += '&';
            }
        }
        return uri;
    }

}

class DomainItem {

    /**
     * Creates a single domain-specific data item.
     * @param id {string}: The id of the domain item.
     * @param object {Object}: The data object with related meta data.
     */
    constructor(id, object) {
        this.id = id;
        this.object = object;
    }

    /**
     * Transforms a DomainItem to JSON.
     * @return {{id: string, object: Object}}: The resulting JSON.
     */
    toJSON() {
        return {
            id: this.id,
            object: this.object,
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a DomainItem object.
     * @param {{id: string, object: Object}} json: The json to be transformed.
     * @return {DomainItem|null}: The resulting DomainItem object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new DomainItem(json.id, json.object);
        } else {
            return null;
        }
    }

    /**
     * Get the id of the DomainItem object.
     * @return {string}: The id of the DomainItem object.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the data object of the DomainItem object.
     * @return {Object}: The data item.
     */
    getObject() {
        return this.object;
    }


    /**
     * Set a new id for the DomainItem object.
     * @param {string} newId: The new id.
     */
    setId(newId) {
        this.id = newId
    }

    /**
     * Set a new data object for the DomainItem object.
     * @param {Object} newObject: The new object.
     */
    setObject(newObject) {
        this.object = newObject;
    }
}

class SoftwareItem {

    /**
     * Creates a single software component with its executionable code.
     * @param {string} id: The id of the software component i.e. minion name.
     * @param {string} code: The code to be interpreted as a string.
     */
    constructor(id, code) {
        this.id = id;
        this.code = code;
    }

    /**
     * Transforms a SoftwareItem to JSON.
     * @return {{code: string, id: string}}: The resulting JSON.
     */
    toJSON() {
        return {
            id: this.id,
            code: this.code.toString()
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a SoftwareItem object.
     * @param {{code: string, id: string}} json: The JSON object to be transformed.
     * @return {null|SoftwareItem}: The resulting SoftwareItem object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new SoftwareItem(json.id, json.code);
        } else {
            return null;
        }
    }

    /**
     * Get the id of the SoftwareItem object.
     * @return {string}: The id of the SoftwareItem object.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the code of the SoftwareItem object.
     * @return {string}: The code of the SoftwareItem object.
     */
    getCode() {
        return this.code;
    }

    /**
     * Interprets the code into a class object.
     * @return {Class}: The intepreted class object.
     */
    getClass() {
        return eval('(' + this.getCode() + ')');
    }

    /**
     * Sets a new id for the SoftwareItem object.
     * @param {string} newId: The new id.
     */
    setId(newId) {
        this.id = newId
    }

    /**
     * Sets a new code for the SoftwareItem object.
     * @param {string} newCode: The new code.
     */
    setCode(newCode) {
        this.code = newCode;
    }
}

/**
 * @deprecated
 */
class ModelItem {

    /**
     * Creates a single model with its id and model including weights and architecture.
     * @param {string} id: The unique id of the model.
     * @param {Object} model: The model including architecture and weigths.
     */
    constructor(id, model) {
        this.id = id;
        this.model = model;
    }

    /**
     * Transforms a ModelItem object to JSON.
     * @return {{model: Object, id: string}}: The resulting JSON object.
     */
    toJSON() {
        return {
            id: this.id,
            model: this.model.toString()
        }
    }

    /**
     * Transforms a JSON object in givens scheme into a ModelItem object.
     * @param {{model: Object, id: string}} json: The ModelItem as JSON object.
     * @return {ModelItem|null}: The resulting ModelItem object if json in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new ModelItem(json.id, json.model);
        } else {
            return null;
        }
    }

    /**
     * Get the id of the ModelItem object.
     * @return {string}: The id of the ModelItem object.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the model.
     * @return {Object}: The model.
     */
    getModel() {
        return this.model;
    }

    /**
     * Set a new id for the ModelItem object.
     * @param {string} newId: The new id.
     */
    setId(newId) {
        this.id = newId;
    }

    /**
     * Set a new model for the ModelItem object.
     * @param {Object} newModel: The new model.
     */
    setModel(newModel) {
        this.model = newModel;
    }
}

class SmartServiceConfigurationItem {

    /**
     * Creates an app configuration item that defines a pipeline of minion execution respectively with their inputs, outputs and connectors.
     * @param {string} id: The identifier of the app configuration.
     * @param {string} version: The version of the app configuration.
     * @param {Array<MinionSpecification>} configuration: The configuration itself.
     * @param {Object} context: Metadata about the configuration parameters.
     * @param {string} name: The name of the smart service (not to be unique).
     * @param {string} descriptionTitle: The title of the smart service description.
     * @param {string} descriptionText: The text of the smart service description.
     */
    constructor(id, version, configuration, context, name, descriptionTitle, descriptionText) {
        this.id = id;
        this.version = version;
        this.configuration = configuration;
        this.context = context;
        this.name = name;
        this.descriptionTitle = descriptionTitle;
        this.descriptionText = descriptionText;
    }

    /**
     * Transforms a SmartServiceConfigurationItem object to JSON.
     * @return {{configuration: Array, descriptionTitle: string, context: Object, name: string, id: string, descriptionText: string, version: string}}: The resulting JSON object.
     */
    toJSON() {
        const config = [];
        for (let minSpec of this.configuration) {
            config.push(minSpec.toJSON());
        }
        return {
            id: this.id,
            version: this.version,
            configuration: config,
            context: this.context,
            name: this.name,
            descriptionTitle: this.descriptionTitle,
            descriptionText: this.descriptionText,
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a SmartServiceConfigurationItem object.
     * @param {{configuration: Array, descriptionTitle: string, context: Object, name: string, id: string, descriptionText: string, version: string}} json: The JSON object.
     * @return {null|SmartServiceConfigurationItem}: The resulting SmartServiceConfigurationItem object if json in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            for (let i = 0; i < json.configuration.length; i++) {
                json.configuration[i] = MinionSpecification.fromJSON(json.configuration[i]);
            }
            return new SmartServiceConfigurationItem(json.id, json.version, json.configuration, json.context, json.name, json.descriptionTitle, json.descriptionText);
        } else {
            return null;
        }
    }

    /**
     * Get the id of the SmartServiceConfigurationItem object.
     * @return {string}: The id of the SmartServiceConfigurationItem object.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the version of the SmartServiceConfigurationItem object.
     * @return {string}: The version of the SmartServiceConfigurationItem object.
     */
    getVersion() {
        return this.version;
    }

    /**
     * Get the configuration i.e. minions and connections as MinionSpecification objects of the SmartServiceConfigurationItem object.
     * @return {Array<MinionSpecification>}: the configuration of the SmartServiceConfigurationItem object.
     */
    getConfiguration() {
        return this.configuration;
    }

    /**
     * Get the context information of the SmartServiceConfigurationItem object.
     * @return {Object}: The context information of the SmartServiceConfigurationItem object.
     */
    getContext() {
        return this.context;
    }

    /**
     * Get the name of the SmartServiceConfigurationItem object.
     * @return {string}: The name of the SmartServiceConfigurationItem object.
     */
    getName() {
        return this.name;
    }

    /**
     * Get the title of description of the SmartServiceConfigurationItem object.
     * @return {string}: the title of description of the SmartServiceConfigurationItem object.
     */
    getDescriptionTitle() {
        return this.descriptionTitle;
    }

    /**
     * Get the text of description of the SmartServiceConfigurationItem object.
     * @return {string}: The text of description of the SmartServiceConfigurationItem object.
     */
    getDescriptionText() {
        return this.descriptionText;
    }
}


/**
 * @deprecated
 */
class Trigger {

    /** Creates a Trigger object that can be transferred and executed in remote environments using broadcast requests.
     * @param {string|null} triggerMethod: A method to be executed in a remote environment.
     * @param {Array<MinionSpecification>|null} minionSpecs: Minions to be executed in a remote environment.
     */
    constructor(triggerMethod = null, minionSpecs = null) {
        this.triggerMethod = triggerMethod;
        this.minionSpecs = minionSpecs;
    }

    /**
     * Transforms a Trigger object to JSON.
     * @return {{minionSpecs: (Array<MinionSpecification>|null), triggerMethod: (string|null)}}: The resulting JSON object.
     */
    toJSON() {
        return {
            triggerMethod: this.triggerMethod ? this.triggerMethod.toString() : null,
            minionSpecs: this.minionSpecs ? this.minionSpecs.toJSON() : null
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a Trigger object.
     * @param {{minionSpecs: (Array<MinionSpecification>|null), triggerMethod: (string|null)}} json: The JSON object to be transformed.
     * @return {null|Trigger}: The resulting Trigger object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            let triggerMethod = json.triggerMethod;
            if (triggerMethod) {
                triggerMethod = eval('(' + triggerMethod + ')');
            }
            return new Trigger(triggerMethod, MinionSpecification.fromJSON(json.minionSpecs));
        } else {
            return null;
        }
    }

    /**
     * Get the trigger method to be executed.
     * @return {string|null}: The trigger method.
     */
    getTriggerMethod() {
        return this.triggerMethod;
    }

    /**
     * Get the MinionSpecification objects.
     * @return {Array<MinionSpecification>|null}: The MinionSpecification objects.
     */
    getMinionSpecs() {
        return this.minionSpecs;
    }
}

class BroadcastConfiguration {

    /**
     * Represents the parameters necessary for a broadcast request.
     * @param {string} source: The id of the requesting agent.
     * @param {Array<string>} targets: The targets of the request i.e. ids or uris etc.
     * @param {BROADCAST_TYPE|string} type: The type of broadcast request i.e. BAAS or UPEER.
     * @param {BROADCAST_CONDITION|string} broadcastCondition: The condition of accepting the broadcast i.e. all requests need to be satisfied or at least one.
     * @param {Trigger|null} trigger: (Optional) A trigger to be executed in the remote environment.
     */
    constructor(source, targets, type = BROADCAST_TYPE.BAAS, broadcastCondition = BROADCAST_CONDITION.ANY, trigger = null) {
        this.source = source;
        this.targets = targets;
        this.type = type;
        this.broadcastCondition = broadcastCondition;
        this.trigger = trigger;
    }

    /**
     * Transform a BroadcastConfiguration object to JSON.
     * @return {{broadcastCondition: (BROADCAST_CONDITION|string), source: string, trigger: (Object|null), type: (BROADCAST_TYPE|string), targets: Array<string>}}: The resulting JSON object.
     */
    toJSON() {
        return {
            source: this.source,
            targets: this.targets,
            type: this.type,
            broadcastCondition: this.broadcastCondition,
            trigger: this.trigger ? this.trigger.toJSON() : null
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a BroadcastConfiguration object.
     * @param {{broadcastCondition: (BROADCAST_CONDITION|string), source: string, trigger: (Object|null), type: (BROADCAST_TYPE|string), targets: Array<string>}} json: The JSON object.
     * @return {null|BroadcastConfiguration}: The resulting BroadcastConfiguration object if json in the given scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new BroadcastConfiguration(json.source, json.targets, json.type, json.broadcastCondition, Trigger.fromJSON(json.trigger));
        } else {
            return null;
        }
    }

    /**
     * Get the targets von the request.
     * @return {Array<string>}: The targets of the request.
     */
    getTargets() {
        return this.targets;
    }

    /**
     * Get the id of the requesting agent.
     * @return {string}: The id of the requesting agent.
     */
    getSource() {
        return this.source;
    }

    /**
     * Get the type of request.
     * @return {BROADCAST_TYPE|string}: The type of requests (i.e. BAAS or UPEER).
     */
    getType() {
        return this.type;
    }

    /**
     * Get the condition to accept the requests response.
     * @return {BROADCAST_CONDITION|string}: The condition i.e. ANY or ALL to be successfull.
     */
    getBroadcastCondition() {
        return this.broadcastCondition;
    }

    /**
     * Get the trigger of the request.
     * @return {Trigger|null}: The trigger of the request.
     */
    getTrigger() {
        return this.trigger;
    }
}

class MinionSpecification {

    /**
     * Creates a MinionSpecification object containing all information necessary for a minion's execution and runtime environment.
     * @param {string} instanceId: The id of this minions instance to be established (needs to be unique during runtime of a service).
     * @param {string} softwareItemId: The id of the software item to be loaded (needs to be unique in the database e.g. URI).
     * @param {Array<string>} targetMinionIds: The ids of the target minions getting resulting data of this minion.
     * @param {string} name: The name of the minion.
     * @param {MINION_TYPE|string} type: The type of the minion i.e. PMIN, TMIN or CMIN.
     * @param {string} description: The description of the minion.
     */
    constructor(instanceId, softwareItemId, targetMinionIds, name, type, description) {
        // TODO define input and output specifications of a minion in order to enable a core matching between them.
        this.instanceId = instanceId;
        this.softwareItemId = softwareItemId;
        this.targetMinionIds = targetMinionIds;
        this.name = name;
        this.type = type;
        this.description = description;
    }

    /**
     * Transform a MinionSpecification object to JSON.
     * @return {{instanceId: string, targetMinionIds: Array<string>, name: string, description: string, type: (MINION_TYPE|string), softwareItemId: string}}: The resulting JSON object.
     */
    toJSON() {
        return {
            instanceId: this.instanceId,
            softwareItemId: this.softwareItemId,
            targetMinionIds: this.targetMinionIds,
            name: this.name,
            type : this.type,
            description : this.description
        }
    }

    /**
     * Transforms a JSON object in the given scheme into a MinionSpecification object.
     * @param {{instanceId: string, targetMinionIds: Array<string>, name: string, description: string, type: (MINION_TYPE|string), softwareItemId: string}} json: The JSON object to be transformed.
     * @return {null|MinionSpecification}: The resulting MinionSpecification object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new MinionSpecification(json.instanceId, json.softwareItemId, json.targetMinionIds, json.name, json.type, json.description);
        } else {
            return null;
        }
    }

    /**
     * Get the instance identifier.
     * @return {string} The instance id.
     */
    getInstanceId() {
        return this.instanceId;
    }

    /**
     * Get the id of the software item of the minion.
     * @return {SoftwareItem} The software item.
     */
    getSoftwareItemId() {
        return this.softwareItemId;
    }

    /**
     * Get the list of target minions.
     * @return {Array<string>} The list of target minions.
     */
    getTargetMinionIds() {
        return this.targetMinionIds;
    }

    /**
     * Get the name of the minion.
     * @return {string}: The name of the minion.
     */
    getName() {
        return this.name;
    }

    /**
     * Get the type of the minion.
     * @return {MINION_TYPE|string}: The type of the minion.
     */
    getType() {
        return this.type;
    }

    /**
     * Get the description of the minion.
     * @return {string}: The description of the minion.
     */
    getDescription() {
        return this.description;
    }

    /**
     * Sets a new instance id.
     * @param {string} newInstanceId: The new instance id.
     */
    setInstanceId(newInstanceId) {
        this.instanceId = newInstanceId;
    }
}

/**
 * @deprecated
 */
class FeatureRequest {
    // TODO: Request might be helpful to distinguish between remote crud operations and access control requests for instance.
    // TODO: Needs a concrete specification about what information is necessary e.g. typeOfRequest, crudOperation, triggers etc.

    /**
     * Creates a FeatureRequest object for broadcast requests.
     * @param {string|Number} id: The id of the request.
     * @param {REQUEST_TYPE|string} type: The type of request i.e. CRUD, TRIGGER, CRUD_TRIGGER, CHECK_ACCESS or REQUEST_ACCESS.
     * @param {CRUDOperation|null} crudOperation: (optional) The CRUDOperation object to be executed.
     * @param {Trigger|null} trigger: /optional) The trigger to be executed.
     */
    constructor(id, type, crudOperation = null, trigger = null) {
        this.id = id;
        this.type = type;
        if (type === REQUEST_TYPE.CRUD || type === REQUEST_TYPE.CRUD_TRIGGER) {
            if (!crudOperation)
                throw new Error('CRUD_OPERATION_TYPE Operation is not defined while trying to build a CRUD_OPERATION_TYPE request.');
            else
                this.crudOperation = crudOperation;
        }
        if (type === REQUEST_TYPE.TRIGGER || type === REQUEST_TYPE.CRUD_TRIGGER) {
            if (!trigger)
                throw new Error('TRIGGER is not defined while trying to build a Trigger request.');
            else
                this.trigger = trigger;
        }
    }

    /**
     * Get the id of the request.
     * @return {string|Number}: The id of the request.
     */
    getId() {
        return this.id;
    }

    /**
     * Get the type of request.
     * @return {REQUEST_TYPE|string}: The type of request.
     */
    getType() {
        return this.type;
    }

    /**
     * Get the CRUDOperation object of the request.
     * @return {CRUDOperation|null}: The CRUDOperation object.
     */
    getCRUDOperation() {
        return this.crudOperation;
    }

    /**
     * Get the Trigger object of the request.
     * @return {Trigger|null}: The Trigger object of the request.
     */
    getTrigger() {
        return this.trigger;
    }

    /**
     * Transform a FeatureRequest object to JSON.
     * @return {{crudOperation: (Object|null), trigger: (Object|null), type: (REQUEST_TYPE|string), id : (string|Number)}}: The resulting JSON object.
     */
    toJSON() {
        return {
            id : this.id,
            type: this.type,
            crudOperation: this.crudOperation ? this.crudOperation.toJSON() : null,
            trigger: this.trigger ? this.trigger.toJSON() : null
        };
    }

    /**
     * Transform a JSON object in the given scheme into a FeatureRequest object.
     * @param {{crudOperation: (Object|null), trigger: (Object|null), type: (REQUEST_TYPE|string), id : (string|Number)}} json: The JSON object to be transformed.
     * @return {FeatureRequest|null}: The resulting FeatureRequest object if json is in the rigth scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new FeatureRequest(json.id, json.type, CRUDOperation.fromJSON(json.crudOperation), Trigger.fromJSON(json.trigger));
        } else return null;
    }
}

/**
 * @deprecated
 */
class FeatureResponse {
    // TODO: Responses migh be helpful to structure the responses of the uPeerCommunicationHandler as well as of the database interfaces and its communication to the rest of the system.
    // TODO: Needs a concrete specification about what information is necessary e.g. success, status, message etc.

    /**
     * Contains information about the result of an initial request.
     * @param {FeatureRequest} initialRequest: The initial request.
     * @param {Object} result: The result of the request.
     */
    constructor(initialRequest, result) {
        this.request = initialRequest;
        this.result = result;
    }

    /**
     * Get the initial request to the response.
     * @return {FeatureRequest}: The initial request.
     */
    getRequest() {
        return this.request;
    }

    /**
     * Get the result of the request.
     * @return {Object}: The result of the request.
     */
    getResult() {
        return this.result;
    }

    /**
     * Transform the FeatureResponse object to JSON.
     * @return {{result: Object, request: {crudOperation: (Object|null), trigger: (Object|null), type: (REQUEST_TYPE|string), id : (string|Number)}}}: The resulting JSON object.
     */
    toJSON() {
        return {
            request: this.request.toJSON(),
            result: this.result
        };
    }

    /**
     * Transfrom a JSON object in the given scheme into a FeatureResponse object.
     * @param {{result: Object, request: {crudOperation: (Object|null), trigger: (Object|null), type: (REQUEST_TYPE|string), id : (string|Number)}}} json: The JSON object to be transformed.
     * @return {null|FeatureResponse}: The resulting FeatureResponse object if json is in the right scheme.
     */
    static fromJSON(json) {
        if (json) {
            return new FeatureResponse(FeatureRequest.fromJSON(json.request), json.result);
        } else return null;
    }
}

module.exports.CRUDOperation = CRUDOperation;
module.exports.DatabaseQuery = DatabaseQuery;
module.exports.DomainItem = DomainItem;
module.exports.SoftwareItem = SoftwareItem;
module.exports.ModelItem = ModelItem;
module.exports.SmartServiceConfigurationItem = SmartServiceConfigurationItem;
module.exports.Trigger = Trigger;
module.exports.BroadcastConfiguration = BroadcastConfiguration;
module.exports.MinionSpecification = MinionSpecification;
module.exports.FeatureRequest = FeatureRequest;
module.exports.FeatureResponse = FeatureResponse;

module.exports.CRUD_OPERATION_TYPE = CRUD_OPERATION_TYPE;
module.exports.OBJECT_TYPE = OBJECT_TYPE;
module.exports.QUERY_TYPE = QUERY_TYPE;
module.exports.REQUEST_TYPE = REQUEST_TYPE;
module.exports.BROADCAST_CONDITION = BROADCAST_CONDITION;
module.exports.BROADCAST_TYPE = BROADCAST_TYPE;
module.exports.RESPONSE_STATUS = RESPONSE_STATUS;
module.exports.MINION_TYPE = MINION_TYPE;
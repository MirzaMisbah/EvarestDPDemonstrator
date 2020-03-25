const model = require('../../model');

/**
 * Interface for classes that represent a UPeerCommunicationHandler Adapter.
 * @interface
 */
class UPeerCommunicationHandler {

	/**
	 * Constructor of the uPeerCommunicationHandler interface.
	 */
	constructor() {
		if (new.target === UPeerCommunicationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }
		this.c = 0;
		this.tPlatform = null;
		this.setup = false;
		this.cStack = [];

		Object.defineProperty(this, 'tucanaPlatform', {get : function () {
				return this.tPlatform;
			}, set(v) {
				this.tPlatform = v;
			}});

		Object.defineProperty(this, 'initialized', {get : function () {
				return this.setup;
			}, set(v) {
				this.setup = v;
			}});

		Object.defineProperty(this, 'counter', {
			get : function () {
				return this.c;
			}, set : function (v) {
				this.c = v;
			}});

		Object.defineProperty(this, 'callStack', {get : function () {
				return this.cStack;
			}, set(v) {
				this.cStack = v;
			}});

		// Set the timeout statically for the time being
		Object.defineProperty(this, 'timeout', {get : function () {
				return 5000;
			}});
	}

	/**
	 * Connects the uPeerCommunicationHandler to the core to handle messages properly.
	 * @param {TucanaCoreService} tucanaPlatform: The TUCANA Core interface.
	 */
	connectToCore(tucanaPlatform) {
		this.tucanaPlatform = tucanaPlatform;
		Object.defineProperty(this, 'identificationHandler', {get : function () {
				return this.tucanaPlatform.getIdentificationHandler();
			}});
		console.log('[PeerCommunicationHandler] Connected to core');
	}

	/**
	 * Initialization function of the UPeerCommunicationHandler Interface; Needs to be called after construction.
	 * @param {TucanaCoreService} tucanaPlatform: The underlying Tucana Platform object for trigger handling and local data accessibility
	 */
	init(tucanaPlatform) {
		//Functionality for the initialization of the communication i.e. setup of handlers, event listeners etc.
		this.connectToCore(tucanaPlatform);
		this.setupEventListener();
		this.initialized = true;
	}

	/**
	 * Handles the request by a connected peer.
	 * @param {Object} req: The request containing the CRUD operation, trigger, id and source
	 * @return {Promise<void>}
	 */
	async handleRequest(req) {
		let res = null;
		if (this.initialized) {
			res = await this.handleCRUDOperation(model.CRUDOperation.fromJSON(req.crudOperation));
			delete res.state;
			delete res.response.req;
		} else {
			res = {success : false, status : 'error', message : 'UPeerCommunicationHandler is not initialized'};
		}
		this.answer(req, res);
	}

	/**
	 * Handles the remote CRUD operation.
	 * @param {CRUDOperation} remoteCRUDOperation: The CRUD operation object.
	 * @return {Promise<Object>} The result of the local operation execution.
	 */
	async handleCRUDOperation(remoteCRUDOperation) {
		if (this.initialized) {
			if (remoteCRUDOperation.getOperationType() === model.CRUD_OPERATION_TYPE.CREATE || remoteCRUDOperation.getOperationType() === model.CRUD_OPERATION_TYPE.UPDATE) {
				this.tucanaPlatform.notifyMinions(remoteCRUDOperation.getObject());
			}
			remoteCRUDOperation.setBroadcastConfiguration(null);
			// TODO: Add try and catch here.
			return await this.tucanaPlatform.requestCRUDOperation(remoteCRUDOperation)
		} else {
			return new Promise ((resolve, reject) => {
				reject('UPeerCommunicationHandler is not initialized.');
			});
		}
	}

	/**
	 * Handles a trigger received by the remote peer.
	 * @param {Trigger} trigger: The trigger to be executed.
	 */
	handleTrigger(trigger) {
		// TODO handling of a remote trigger
		if (this.initialized) {
			console.warn('Method not implemented yet.');
		}
	}

	/**
	 * Answers a request.
	 * @param {Object} req: The initial request of the remote peer.
	 * @param {Object} res: The result of the local execution.
	 */
	answer (req, res) {
		this.transfer( model.CRUDOperation.fromJSON(req.crudOperation).getBroadcastConfiguration().getSource(),{req: req, res: res});
	}

	/**
	 * Internal function handling the response of the requested peer.
	 * @param req: The initial request.
	 * @param res: The remote peers response.
	 */
	handleResponse(req, res) {
		const id = req.id;
		const method = this.callStack[id];
		method.fun(req, res);
	}

	/**
	 * Executes a broadcast CRUD operation based on the BroadcastConfiguration within the CRUDOperation.
	 * @param {CRUDOperation} crudOperation: The broadcast CRUD operation to be executed.
	 * @return {Array<Promise<Object>>}: The result of the CRUD operation.
	 */
	async _executeBroadcastCRUDOperation(crudOperation) {
		// Formulate a request and use transfer to share the request with a peer
		if (this.initialized) {
			const _this = this;
			const promises = [];
			for (let targetRessource of crudOperation.getBroadcastConfiguration().getTargets()) {
				const id = _this.callStack.length;
				const request = {
					id : id,
					type: "req",
					source : crudOperation.getBroadcastConfiguration().getSource(),
					target: targetRessource,
					crudOperation : crudOperation.toJSON(),
				};
				promises.push(
					Promise.race([
						new Promise((resolve, reject) => {
							_this.callStack.push({id: id, fun : function (req, res) {
									if (req && res) {
										resolve({req : req, res : res});
									} else {
										resolve({req : request, res : {success : false, status: 'error', message: 'Got wrong response format.'}});
									}
								}});
							_this.transfer(request.target, request);
						}),
						// Setup a timeout such that long duration of requests will lead to a timeout.
						new Promise((resolve, reject) => {
							let timeout = setTimeout(() => {
								clearTimeout(timeout);
								// Clear the callback function.
								_this.callStack[id].fun = function(req, res) {
									return;
								};
								resolve({req : request, res : {success : false, status: 'error', message: 'Timed out in ' + _this.timeout + 'ms.'}});
							}, _this.timeout)
						})
					]));
			}
			return Promise.all(promises.map(p => p.catch(error => {
				console.error(error);
				return {res : {success : false, status: 'failed', message: error}};
			})));
		} else {
			return new Promise((resolve, reject) => {
				reject('UPeerCommunicationHandler is not initialized.');
			});
		}

	}

	New_executeBroadcastCRUDOperation(crudOperation) {
		// Formulate a request and use transfer to share the request with a peer
		if (this.initialized) {
			const _this = this;
			const promises = [];
			for (let targetRessource of crudOperation.getBroadcastConfiguration().getTargets()) {
				const id = _this.callStack.length;
				const request = {
					id : id,
					type: "req",
					source : crudOperation.getBroadcastConfiguration().getSource(),
					target: targetRessource,
					crudOperation : crudOperation.toJSON(),
				};
				promises.push(
					Promise.race([
						new Promise((resolve, reject) => {
							_this.callStack.push({id: id, fun : function (req, res) {
									if (req && res) {
										resolve({req : req, res : res});
									} else {
										resolve({req : request, res : {success : false, status: 'error', message: 'Got wrong response format.'}});
									}
								}});
							_this.transfer(request.target, request);
						}),
						// Setup a timeout such that long duration of requests will lead to a timeout.
						new Promise((resolve, reject) => {
							let timeout = setTimeout(() => {
								clearTimeout(timeout);
								// Clear the callback function.
								_this.callStack[id].fun = function(req, res) {
									return;
								};
								resolve({req : request, res : {success : false, status: 'error', message: 'Timed out in ' + _this.timeout + 'ms.'}});
							}, _this.timeout)
						})
					]));
			}
			return Promise.all(promises.map(p => p.catch(error => {
				console.error(error);
				return {res : {success : false, status: 'failed', message: error}};
			})));
		} else {
			return new Promise((resolve, reject) => {
				reject('UPeerCommunicationHandler is not initialized.');
			});
		}

	}

	/**
	 * Transfer a request to the remote peers to check whether ressource access is provided or not.
	 * @param {CRUDOperation} crudOperation: The CRUDOperation.
	 * @return {Array<Promise<Object>>}: The result of the request.
	 */
	async broadcastRessourceAccess(crudOperation) {
		// Sends a CRUDOperation and checks whether the remote peer allows access to the environment
		return await this._executeBroadcastCRUDOperation(crudOperation);
	}
	NewbroadcastRessourceAccess(crudOperation) {
		// Sends a CRUDOperation and checks whether the remote peer allows access to the environment
		return this.New_executeBroadcastCRUDOperation(crudOperation);
	}
	/**
	 * Transfer a request to the remote peer to request access permission.
	 * @param {String} targetPeerID: The id of the target peer.
	 * @return {Promise<Object>}: The result of the request.
	 */
	async requestAccessPermission(targetPeerID) {
		// Request for access to the remote environment.
		// TODO Implement this function and use transfer to send a request to a remote peer.
		console.warn('Method not implemented yet.');
	}

	/**
	 * Setup of the event listeners for environmental communication as well as for peer communication.
	 */
	setupEventListener() {
		throw new Error('You have to implement the method setupEventListener.');

	}

	/**
	 * Transfer function for json objects to a target id.
	 * @param {String} target: The target id.
	 * @param {Object} object: The object to be transferred.
	 */
	transfer(target, object) {
		throw new Error('You have to implement the method transfer.');
	}

	/**
	 * Returns all accessible peers in a network with the given properties.
	 * @param {Array} properties: The properties to fulfill.
	 * @return {Promise<Array>}: The list of the filtered peers.
	 */
	async getFilteredPeerIds(properties) {
		// Return the accessible peer ids in the network e.g. based on intelligent broadcasting
		throw new Error('You have to implement the method getFilteredPeerIds.');
	}
}

module.exports.UPeerCommunicationHandler = UPeerCommunicationHandler;

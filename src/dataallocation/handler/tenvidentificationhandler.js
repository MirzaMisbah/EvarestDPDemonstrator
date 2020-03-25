/**
 * Interface for classes that represent a TENVIdentificationHandler Adapter.
 * @interface
 */

class TENVIdentificationHandler {


    /**
     * Contructor of the tenvIdentificationHandler interface.
     */
    constructor() {
        if (new.target === TENVIdentificationHandler) {
            throw new Error('Interfaces cannot be instantiated.');
        }
    }

    /**
     * Returns the local id of the peer.
     * @return {String}: The local id of the peer.
     */
    getLocalID() {
        throw new Error('You have to implement the method getLocalID.')
    }

    /**
     * Returns all properties of the peer.
     *@return {Object}: The properties of the peer.
     */
    getProperties() {
        throw new Error('You have to implement the method getLocalID.')
    }

    /**
     * Returns the name of the peer.
     * @return {String}: The name of the peer.
     */
    getName() {
        throw new Error('You have to implement the method getName.')
    }

    /**
     * Returns the type of the peer.
     * @return {String}: The type of the peer.
     */
    getType() {
        throw new Error('You have to implement the method getType.')
    }

    /**
     * Returns the geographic information of the peer.
     * @return {String}: The geographic information of the peer.
     */
    async getGeography() {
        throw new Error('You have to implement the method getType.')
    }

    /**
     * Returns the software offering of the peer.
     * @return {String}: The software offering of the peer.
     */
    getSoftwareOffering() {
        throw new Error('You have to implement the method getSoftwareOffering.')
    }

    /**
     * Returns the model offering of the peer.
     * @return {String}: The model offering of the peer.
     */
    getModelOffering() {
        throw new Error('You have to implement the method getModelOffering.')
    }

    /**
     * Returns the content offering of the peer.
     * @return {String}: The content offering of the peer.
     */
    getContentOffering() {
        throw new Error('You have to implement the method getContentOffering.')
    }

    /**
     * Returns the keywords of the peer.
     * @return {Array}: The keywords of the peer.
     */
    getKeywords() {
        throw new Error('You have to implement the method getKeywords.')
    }

}

module.exports.TENVIdentificationHandler = TENVIdentificationHandler;
(function (root) {
    'use strict';
    class CommunicationHelper{
        constructor(signalingServer, userId, webrtcConfiguration){
            if (!signalingServer || !userId || !webrtcConfiguration){
                throw Error('[Communication Helper] Not all arguments given');
            }

            var _self           = this;
            var config          = {};
            config.ssAddress    = signalingServer;
            config.myId         = userId;
            config.rtcConfig    = webrtcConfiguration;


            var callbacks = {
                onStatusUpdate : this.statusHandler,
                onPeerMsg : function(peerId, msg){
                    _self.messageHandler(_self, peerId, msg);
                },
                onPeerConnected : function(peerId){
                    _self.peerconnectedHandler(_self, peerId);
                },
                onPeerDisconnected : function(peerId){
                    _self.peerdisconnectedHandler(_self, peerId);
                },
                onError : this.errorHandler
            };

            this.conn = new PeerCommunication(config, callbacks);
        }


        /***************************************************
         *  Sending functions
         **************************************************/
        connect(emailsList){
            this.sendMessage(emailsList, 'I am online!');
        }

        sendBasicMinion(emailsList, minion){
            console.log('sending subMinion', minion);
            var msg = {
                type : PeerCommunication.MSG_TAGS.TYPE_DATA,
                data : {
                    type: "bminion",
                    value: minion
                }
            };
            this.send(emailsList, msg);

        }

        sendStartLap(emailsList, p_lapName, p_interval){
            var msg = {
                type : PeerCommunication.MSG_TAGS.TYPE_DATA,
                data : {
                    type: 'lap',
                    value: {
                        name: p_lapName,
                        interval: p_interval
                    }
                }
            };
            console.log("sendStartLap", msg);
            this.send(emailsList, msg);
        }

        sendStopLap(emailsList){
            var msg = {
                type : PeerCommunication.MSG_TAGS.TYPE_DATA,
                data : {
                    type: 'stoplap',
                    value: {
                        name: 'placeholder'
                    }
                }
            };
            this.send(emailsList, msg);
        }

        sendWorkerMinion(emailsList, minion){
            console.error("NOT_IMPLEMENTED");
        }

        sendSensor(emailsList, name, lap, buffer){ // TODO: change this to send data
            var msg = {
                type : PeerCommunication.MSG_TAGS.TYPE_DATA,
                data : {
                    type : "sensor",
                    value : {
                        name : name,
                        lap: lap,
                        values : buffer
                    }
                }
            };
            return this.send(emailsList, msg, true);
        }

        sendMessage(emailsList, text){
            var msg = {
                type : PeerCommunication.MSG_TAGS.TYPE_TEXT,
                data : text.trim()
            };
            this.send(emailsList, msg);
        }

        send(emailsList, msg, returnonfailure = false){
            var sent = true;
            let connection = this.conn;
            if(msg.type === PeerCommunication.MSG_TAGS.TYPE_DATA){
                msg.data = JSON.stringify(msg.data);
            }
            if(emailsList.includes(myContactInfo.email)){
                app.showNotification('You should not send to yourself', 1000);
                return;
            }
            emailsList.forEach(function(email){
                sent = connection.sendToPeer(email, msg, returnonfailure);
                if(returnonfailure && !sent){
                    return; // break the loop
                }
            });
            return sent;

        }

        /**************************************************
         *  Internal handlers
         **************************************************/
        errorHandler(err){
            switch(err) {
                case PeerCommunication.ERROR.SERVER_NA:
                    app.showNotification("The Signaling server is currently not reachable", 3000);
                    break;
                case PeerCommunication.ERROR.ERR_USERNA:
                    console.warn('[CommunicationHelper] User is currently offine');
                    break;
                default:
                    console.error(err);
            }
        }

        messageHandler(_self, peerId, msg){
            switch(msg.type){
                case PeerCommunication.MSG_TAGS.TYPE_TEXT:
                    if(_self.onmessage)
                        _self.onmessage(peerId, msg.data);
                    break;
                case PeerCommunication.MSG_TAGS.TYPE_DATA:
                    switch(msg.data.type){
                        case 'sensor':
                            if(_self.onsensor)
                                _self.onsensor(peerId, msg.data.value);
                            break;
                        case 'bminion':
                            if(_self.onbasicminion)
                                _self.onbasicminion(peerId, msg.data.value);
                            break;
                        case 'wminion':
                            if(_self.onworkerminion)
                                _self.onworkerminion(peerId, msg.data.value);
                            break;
                        case 'lap':
                            if(_self.onstartlap)
                                _self.onstartlap(peerId, msg.data.value);
                            break;
                        case 'stoplap':
                            if(_self.onstoplap)
                                _self.onstoplap(peerId, msg.data.value);
                            break;
                        default:
                            console.error("unknown data type received", msg.data.type);
                    }
                    break;
                default:
                    console.error("unknown message type received", msg.type);
            }
        }

        peerconnectedHandler(_self, email){
            if(_self.onpeerconnected)
                _self.onpeerconnected(email);
        }

        peerdisconnectedHandler(_self, email){
            if(_self.onpeerdisconnected)
                _self.onpeerdisconnected(email);
        }

        statusHandler(status){
            if(status === 'SS_LOGGED_IN'){
                communicationHelper.connect(getEmailListMineExcluded());
            }
        }

        /*************************************************
         * callbacks setters
         *************************************************/
        set onSensor(callback){
            this.onsensor = callback;
        }
        set onMessage(callback){
            this.onmessage = callback;
        }
        set onWorkerMinion(callback){
            this.onworkerminion = callback;
        }
        set onBasicMinion(callback){
            this.onbasicminion = callback;
        }
        set onPeerConnected(callback){
            this.onpeerconnected = callback;
        }
        set onPeerDisconnected(callback){
            this.onpeerdisconnected = callback;
        }
        set onStartLap(callback){
            this.onstartlap = callback;
        }
        set onStopLap(callback){
            this.onstoplap = callback;
        }
    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CommunicationHelper;
    } else if (typeof exports !== 'undefined') {
        exports.CommunicationHelper = CommunicationHelper;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return CommunicationHelper;
        });
    } else {
        root.CommunicationHelper = CommunicationHelper;
    }
})(this);


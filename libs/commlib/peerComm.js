/**
 * About:
 * 		@desc: This Libaray, wraps the WebRTC Peer communication and the Signaling Server
 * 		@author: Shahd Zahran
 * 		@dates: Nov-Dec 2017
 *
 *
 * Useful Links:
 * 			To help you understand the implementation of this library, take a look at the following links
 *			https://www.tutorialspoint.com/webrtc/webrtc_text_demo.htm
 * 			https://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcdatachannel
 *
 * Dependencies:
 * 			The signaling server must be up and running before the communication takes place
 *
 * Limitations:
 * 			At the moment the communication can succeed IFF both peers are on the same WLAN/LAN
 *
 * Usage Instructions: In order to use the library you need two main things:
 * 				1. create an object, in the callbacks parameters there is a callback for receiving messages
 * 					var comm = PeerCommunication(config, callbacks); // check full documentation of paramters on the constructor header
 * 				2. use the object to send messages
 * 					comm.sendToPeer(peerId, msg); // check full documentation of paramters on the function header
 *
 */

(function (root) {
    'use strict';

    /**
     * @class PeerCommunication
     * @param {Object} config WEBRTC config object like in https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
     * @param {function} callbacks A JSON object with all relevant callbacks <br>
     * 			var callbacks = {
     * 				onStatusUpdate : function(status) {	},
     * 				onStatusUpdate : function(status) {	},
     * 				onStatusUpdate : function(status) {	},
     * 				onPeerMsg : function(peerId, msg) {}, // msg =  {type:PeerCommunication.MSG_TAGS.TYPE_TEXT/PeerCommunication.MSG_TAGS.TYPE_DATA, data:(STRING/JSON resp.)}
     * 				onPeerConnected : function(peerId) {},
     * 				onPeerDisconnected : function(peerId) {},
     * 				onError : function(err) {}
     * 			};
     */
    function PeerCommunication(config, callbacks) {//TODO: check how to make parameters optional e.g. error handler
        /**
         * Class Members
         */
        this.config = config;
        this.connectedPeers = {};
        this.onStatusUpdate = callbacks.onStatusUpdate;
        this.onPeerMsg = callbacks.onPeerMsg;
        this.onPeerConnected = callbacks.onPeerConnected;
        this.onPeerDisconnected = callbacks.onPeerDisconnected;
        this.onError = callbacks.onError;
        this.init();
        // this dict maintains the list of peers that sent the initial offer. on ICE restart, this peer will try to
        // send the offer again to create connection
        this.initiatedOffer = {};
        // the list of peers that are in webrtc:failed state
        this.failedConn= {};
        // this buffer contains msgs to be sent to the signalling server. if conn to the signalling server fails, the
        // msgs are buffered and on reconnection, sent to the server
        this.bufferSS = [];
    }


    /**
     * @static
     * @memberOf PeerCommunication
     * @type {{LOGIN: string, OFFER: string, ANSWER: string, CANDIDATE: string, LEAVE: string}}
     */
    PeerCommunication.ServerMsgs = {
        LOGIN : "login",
        OFFER : "offer",
        ANSWER : "answer",
        CANDIDATE : "candidate",
        LEAVE : "leave"

    };

    /**
     * @static
     * @memberOf PeerCommunication
     * @type {{START: string, END: string, TYPE_DATA: string, TYPE_TEXT: string}}
     */
    PeerCommunication.MSG_TAGS = {
        START : "<START>",
        END : "<END>",
        TYPE_DATA : "<DATA>",
        TYPE_TEXT : "<TEXT>"
    };

    /**
     * @static
     * @memberOf PeerCommunication
     * @type {{SS_CONNECTED: string, SS_LOGGED: string, SS_OFFER: string, SS_ANSWER: string, SS_CANDIDATE: string, SS_LEAVE: string, SS_TO_MSG: string, PEER_MSG_RECEIVE: string, PEER_MSG_SEND: string, PEER_SEND_CHANNEL_STATUS: string, PEER_RECEIEVE_CHANNEL_STATUS: string, PEER_CONNECTION_STATUS: string, PEER_CANDIDATE: string}}
     */
    PeerCommunication.COMM_STATUS = {
        SS_CONNECTED : "SS_CONNECTED",
        SS_LOGGED : "SS_LOGGED_IN",
        SS_OFFER : "SS_OFFER: ",
        SS_ANSWER : "SS_ANSWER: ",
        SS_CANDIDATE : "SS_CANDIDATE: ",
        SS_LEAVE : "SS_LEAVE: ",
        SS_TO_MSG : "TO_SS_MSG: ",
        PEER_MSG_RECEIVE : "FROM_PEER_MSG: ",
        PEER_MSG_SEND : "TO_PEER_MSG: ",
        PEER_SEND_CHANNEL_STATUS : "PEER_SEND_CHANNEL_STATUS: ",
        PEER_RECEIEVE_CHANNEL_STATUS : "PEER_RECEIEVE_CHANNEL_STATUS: ",
        PEER_CONNECTION_STATUS : "PEER_CONNECTION_STATUS: ",
        PEER_CANDIDATE : "ICE_CANDIDATE: "

    };

    /**
     * @static
     * @memberOf PeerCommunication
     * @type {{SERVER_NA: string, USER_NA: string, ERR_USERNA: string, ERR_COMMANDNA: string}}
     */
    PeerCommunication.ERROR = {
        SERVER_NA : "Signaling Server Not Available",
        USER_NA: "User is not connect to the signaling server",
        ERR_USERNA: "USER_NA",
        ERR_COMMANDNA: "COMMAND_NA"
    };

    PeerCommunication.prototype = {

        /******************************************************************************************************************************
         * 													Public Methods
         ******************************************************************************************************************************/

        /**
         * @inner
         * @memberOf PeerCommunication
         * @param {String} peerId The target peer ID you want to send the message to
         * @param {String} msg	A JSON object {type:PeerCommunication.MSG_TAGS.TYPE_TEXT/PeerCommunication.MSG_TAGS.TYPE_DATA, data:(STRING/JSON resp.)}
         *
         */
        sendToPeer : function(peerId, msg, returnonfailure = false) {
            const I = this;

            // are we already connected to the peer?
            if (this.connectedPeers[peerId]) {
                var sendChannel = this.connectedPeers[peerId].sendChannel;
                if (sendChannel) {
                    if (sendChannel.readyState === "open") {// we can only send if the send channel is open
                        try {
                            //sendChannel.send(msg);
                            this.sendChunckedToPeer(sendChannel, msg);
                            this.issueStatusUpdate(this, PeerCommunication.COMM_STATUS.PEER_MSG_SEND + peerId);
                            return true;
                        } catch(err) {
                            console.error(err);
                            //TODO: LOG_ERR
                        }
                    } else {// wait on the callback when it opens
                        I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_SEND_CHANNEL_STATUS + sendChannel.readyState);
                        if(returnonfailure)
                            return false;
                        I.connectedPeers[peerId].onSendChannelOpen = function() {
                            I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_SEND_CHANNEL_STATUS + sendChannel.readyState);
                            I.sendToPeer(peerId, msg);
                        };
                    }
                } else {
                    I.issueStatusUpdate(I, "send channel is not defined");
                    //TODO: LOG_ERR
                }
            } else {
                // this part mean we never connected to the given peer before.

                // we attempt to connect to the peer!
                var peer = this.connectToPeer(this, peerId);

                // this function will be called when the connection is ready
                // TODO: TEST_THOROUGHLY
                I.onReady = function() {
                    I.sendToPeer(peerId, msg);
                };

                // we creat an offer
                peer.localConnection.createOffer({
                    iceRestart : false	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
                }).then(function(offer) {
                    I.initiatedOffer[peerId] = true;
                    peer.localConnection.setLocalDescription(offer);
                    // we forward the offer to the signaling server
                    var msg = I.formatServerMsg(PeerCommunication.ServerMsgs.OFFER, I.config.myId, peerId, offer);
                    I.sendToSS(I, msg);
                }, function(error) {
                    I.issueStatusUpdate(I, "Encountered an error while creating offer ", error);
                    //TODO: LOG_ERR
                });
            }
	    },

        /**
         *
         * @description An attempt to send a huge amount of data.
         * @link https://github.com/webrtc/samples/blob/gh-pages/src/content/datachannel/datatransfer/js/main.js
         * @inner
         * @memberOf PeerCommunication
         * @param {Object} sendChannel The WebRTC channel to be used.
         * @param {Object} msg The message to be sent.
         */
        sendChunckedToPeer : function(sendChannel, msg) {
            var data = msg.data;
            var type = msg.type;
            var sendMax = data.length;
            var sendValue = 0;
            var curIndex = 0;
            var endIndex = 0;

            var chunkSize = 16384;
            var bufferFullThreshold = 5 * chunkSize;
            var usePolling = true;
            if ( typeof sendChannel.bufferedAmountLowThreshold === 'number') {
                usePolling = false;

                // Reduce the buffer fullness threshold, since we now have more efficient
                // buffer management.
                bufferFullThreshold = chunkSize / 2;

                // This is "overcontrol": our high and low thresholds are the same.
                sendChannel.bufferedAmountLowThreshold = bufferFullThreshold;
            }//if

            // Listen for one bufferedamountlow event.
            var listener = function() {
                sendChannel.removeEventListener('bufferedamountlow', listener);
                sendAllData();
            };
            var sendAllData = function() {
                // Try to queue up a bunch of data and back off when the channel starts to
                // fill up. We don't setTimeout after each send since this lowers our
                // throughput quite a bit (setTimeout(fn, 0) can take hundreds of milli-
                // seconds to execute).
                while (sendValue < sendMax) {
                    if (sendChannel.bufferedAmount > bufferFullThreshold) {
                        if (usePolling) {
                            setTimeout(sendAllData, 250);
                        } else {
                            sendChannel.addEventListener('bufferedamountlow', listener);
                        }
                        return;
                    }
                    sendValue += chunkSize;

                    endIndex = curIndex + chunkSize > data.length ? data.length : curIndex + chunkSize;
                    var msg = data.substring(curIndex, endIndex);
                    if (curIndex == 0) {
                        sendChannel.send(PeerCommunication.MSG_TAGS.START);
                        sendChannel.send(type);
                    }
                    sendChannel.send(msg);
                    if (endIndex >= data.length) {
                        sendChannel.send(PeerCommunication.MSG_TAGS.END);
                    }
                    curIndex = endIndex;
                }
            };
            setTimeout(sendAllData, 0);
        },

        /**
         * Disconnects from the signaling server
         * @inner
         * @memberOf PeerCommunication
         */
        disconnect : function() {
            var msg = this.formatServerMsg(PeerCommunication.ServerMsgs.LEAVE, this.config.myId, null, null);
            this.sendToSS(this, msg);
        },

        /**
         * Issues a single status update of a peer
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {String} status The new status
         */
        issueStatusUpdate : function(I, status) {
            if (I && I.onStatusUpdate) {
                I.onStatusUpdate(status);
            }
            log("[PeerCommunication] ", status);
        },

        /**
         * Message handler
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {Object} msg The received message
         */
        onSSMessage : function(I, msg) {
            var msgObj = JSON.parse(msg.data);
            switch(msgObj.type) {
                case "login":
                    I.handleLogin(I, msgObj.success);
                    break;
                case "offer":
                    I.handleOffer(I, msgObj.offer, msgObj.from);
                    break;
                case "answer":
                    I.handleAnswer(I, msgObj.answer, msgObj.from);
                    break;
                case "candidate":
                    I.handleCandidate(I, msgObj.candidate, msgObj.from);
                    break;
                case "leave":
                    I.handleLeave(I, msgObj.from);
                    break;
                case "greetings":
                    I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_CONNECTED);
                    break;
                case "error":
                    I.onSSError(I, msgObj.error);
                    break;
                default:
                    break;
            }
        },

        /**
         * Error handler
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {String} err The error
         */
        onSSError : function(I, err) {
            I.onError(err);
        },

        /**
         * Handles a new login to the WebRTC environment.
         * @param {PeerCommunication} I The current PeerCommunication object.
         * @param {Boolean} success The success status.
         */
        handleLogin : function(I, success) {
            if (success) {
                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_LOGGED);
                // login to SS successful, forward the buffered msgs
                //I.sendto
            } else {
                I.onSSError(I, "Failed to Login");
                //TODO: LOG_ERR
            }

        },

        /**
         * We received an offer from another peer. <br>
         * For now we'll accept the offers by sending an answer!
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {Object} offer A new offer.
         * @param {String} peerId ID of peer to communicate with.
         */
        handleOffer : function(I, offer, peerId) {
            var to_connect = true;
            I.initiatedOffer[peerId] = false;

            var peer;
            if(peerId in I.failedConn) {
                if(I.failedConn[peerId] == true) {
                    peer = I.connectedPeers[peerId];

                    //set to false again
                    I.failedConn[peerId] = false;

                    // don't attemt to connect. ice restart in progress
                    to_connect = false;
                }
            }

            if(to_connect) {
                // we received an offer from a peer we create the RTC connection
                peer = I.connectToPeer(I, peerId);
            }

                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_OFFER + peerId);
                // we set the connection remote description to the given offer!
                peer.localConnection.setRemoteDescription(new RTCSessionDescription(offer));

                //create an answer to an offer
                peer.localConnection.createAnswer(function(answer) {
                    // we creat an answer and set the channel local description to the answer!
                    peer.localConnection.setLocalDescription(answer);
                    var msg = I.formatServerMsg(PeerCommunication.ServerMsgs.ANSWER, I.config.myId, peerId, answer);
                    I.sendToSS(I, msg);
                }, function(error) {
                    I.issueStatusUpdate(I, "create answer: " + error);
                    //TODO: LOG_ERR
                });

        },
        /**
         * We have an answer to an offer we sent
         */
        /**
         * Handles received answer from other peer.
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {Object} answer The received answer
         * @param {String} from ID of peer that sent the answer
         */
        handleAnswer : function(I, answer, from) {
            if(from in I.failedConn) {
                //set to false
                I.failedConn[from] = false
            }

            I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_ANSWER + from);
            // we set the remote description of the channel we previously created to the answer
            I.connectedPeers[from].localConnection.setRemoteDescription(new RTCSessionDescription(answer));
        },

        /**
         * We might receive multiple candidates from a peer
         */
        /**
         * Handles a new candidate.
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {Object} candidate The new candidate.
         * @param {String} from ID of peer that sent the candidate.
         */
        handleCandidate : function(I, candidate, from) {
            /* *
             *TODO: BUG: when connecting to a WiFi eduroam we receive multiple candidates which causes the connection to fail somehow!
             * This bug is not solved! it is possible that it is not a bug as well!
             */
            I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_CANDIDATE + from);
            var candidateObj = new RTCIceCandidate(candidate);
            if(I.connectedPeers[from] == null){
                I.onError("Received Candidate from not connected user");
                return;
            }
            I.connectedPeers[from].localConnection.addIceCandidate(candidateObj).then(function() {
                // this value is only for debugging
                I.connectedPeers[from].noCand = I.connectedPeers[from].noCand + 1;
                I.connectedPeers[from].ready = true;
                if (I.onReady)
                    I.onReady();
            }, function(error) {
                I.onError(error);
            });
        },
        handleLeave : function(I, from) {
            I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_LEAVE + from);
            if (I.connectedPeers[from]) {
                I.connectedPeers[from].localConnection.onicecandidate = null;
                I.connectedPeers[from].localConnection.close();
                delete I.connectedPeers[from];
                if (I.onPeerDisconnected)
                    I.onPeerDisconnected(from);
            }

        },

        /**
         * @inner
         * @memberOf PeerCommunication
         * @param {Object} m_type: one of the values here PeerCommunication.ServerMsgs
         * @param {Object} m_from: our ID
         * @param {Object} m_to: the ID of the target peer
         * @param {Object} m_content: the message data object e.g. the offer/answer/candidate object, we wish to forward
         */
        formatServerMsg : function(m_type, m_from, m_to, m_content) {
            return {
                type : m_type,
                from : m_from,
                to : m_to,
                content : m_content
            };
        },

        /**
         * Send a new message to the signaling server
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {JSON} msg The message to be sent.
         */
        sendToSS : function(I, msg) {
            var msgStr = JSON.stringify(msg);
                // if connection to SS is not established yet or disconnected, buffer the messages
            if(I.ssConn.readyState != 1) {
                I.bufferSS.push(msgStr); // TODO: empty the buffer
            } else {
                I.ssConn.send(msgStr);
                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.SS_TO_MSG + msg.type + (msg.to?(" to " + msg.to): ""));

                // now that we have the connection: forward the msgs
                while (I.bufferSS.length > 0) {
                    I.ssConn.send(I.bufferSS.splice(0, 1));
                }
            }
        },

        /**
         * Initiate a new login to the signaling server.
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         */
        loginToSS : function(I) {
            var msgLogin = I.formatServerMsg(PeerCommunication.ServerMsgs.LOGIN, I.config.myId, null, null);
            I.sendToSS(I, msgLogin);
        },

        /**
         * Establish a new connection to another peer.
         * @inner
         * @memberOf PeerCommunication
         * @param {PeerCommunication} I The current PeerCommunication object
         * @param {String} peerId ID of peer to connect to
         * @returns {Object} The connected peer.
         */
        connectToPeer : function(I, peerId) {
            var peer = I.connectedPeers[peerId] = new Object();
            peer.ready = false;
            peer.noCand = 0;

            // Creating local channel for it
            peer.localConnection = new RTCPeerConnection(this.config.rtcConfig);

            // what happens onicecandidate
            peer.localConnection.onicecandidate = function(event) {
                if (event.candidate) {
                    I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_CANDIDATE + peerId);
                    var msg = I.formatServerMsg(PeerCommunication.ServerMsgs.CANDIDATE, I.config.myId, peerId, event.candidate);
                    I.sendToSS(I, msg);
                }
            };

            peer.localConnection.oniceconnectionstatechange = function(event) {
                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_CONNECTION_STATUS + peerId + " is " + peer.localConnection.iceConnectionState);

                if (peer.localConnection.iceConnectionState == "connected") {// notify that this peer is connected now!
                    if (I.onPeerConnected) {
                        I.onPeerConnected(peerId);
                    }

                }
                if (peer.localConnection.iceConnectionState == "failed") {
                    I.failedConn[peerId] = true;
                    // the connection is now in failed state. perform ICE restart: https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
                    // create an offer
                    // TODO: sometimes in case of network shift (e.g. b/w mobile data and wifi) one peer goes into failed state before the other
                    // if an offer is received before going to failed state, this causes connection failure
                    // for now, a hackish solution is to wait for a small amount of time before initiating ice restart. this solves the issue but
                    // this needs to be replaces with a proper solution
                    setTimeout(function() {
                        if(peerId in I.initiatedOffer) {
                            if(I.initiatedOffer[peerId]) {
                                peer.localConnection.createOffer({
                                    iceRestart : true	// https://medium.com/the-making-of-appear-in/ice-restarts-5d759caceda6
                                }).then(function(offer) {
                                    peer.localConnection.setLocalDescription(offer);

                                    // we forward the offer to the signaling server
                                    var msg = I.formatServerMsg(PeerCommunication.ServerMsgs.OFFER, I.config.myId, peerId, offer);
                                    I.sendToSS(I, msg);
                                }, function(error) {
                                    I.issueStatusUpdate(I, "Encountered an error while performing ICE restart ", error);
                                    //TODO: LOG_ERR
                                });
                            }
                        }
                    }, 1000);
                }
            };

            // what happens when receiving data
            peer.localConnection.ondatachannel = function(event) {// TODO: what happens when multi messeges send at once!
                peer.receiveChannel = event.channel;

                var receivedData = new Object();

                peer.receiveChannel.onmessage = function(event) {
                    // we forward the received message through the callback!
                    if (event.data === PeerCommunication.MSG_TAGS.START) {
                        receivedData.start = true;
                        receivedData.data = "";
                        receivedData.end = false;

                    }else if(event.data === PeerCommunication.MSG_TAGS.TYPE_DATA || event.data === PeerCommunication.MSG_TAGS.TYPE_TEXT){
                        receivedData.type = event.data;
                    }else if (event.data === PeerCommunication.MSG_TAGS.END) {
                        receivedData.start = false;
                        var _data = "";
                        try {
                            if(receivedData.type === PeerCommunication.MSG_TAGS.TYPE_DATA){
                                _data =  JSON.parse(receivedData.data);
                            }else{
                                // TODO: here we spot a bug sometimes the parsing does not work!
                                _data = receivedData.data;
                            }
                        } catch(err) {
                            // TODO: more testing and debugging why the JSON will fail to parse the data!
                            console.error("ERROR PARSING JSON: ", err, receivedData.data);
                            _data = receivedData.data;
                        }
                        var msg = {
                            type: receivedData.type,
                            data: _data
                        };
                        I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_MSG_RECEIVE + peerId + " " + receivedData.type);
                        I.onPeerMsg(peerId, msg);
                        receivedData.end = true;
                    } else {
                        receivedData.data += event.data;
                    }

                };
                //onmessage

                peer.receiveChannel.onclose = function() {
                    I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_RECEIEVE_CHANNEL_STATUS + peerId + " CLOSED ");
                    // TODO: have one receive clean up function that gets called here
                };
                //onclose
            };

            //creating send channel
            peer.sendChannel = peer.localConnection.createDataChannel(peerId + "_channel", {
                reliable : true
            });

            peer.sendChannel.onerror = function(error) {
                //TODO: LOG_ERR
                I.issueStatusUpdate(I, "error on send channel of peer " + peerId + " " + error);
            };

            peer.sendChannel.onopen = function() {
                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_SEND_CHANNEL_STATUS + peerId + " OPEN ");
                if (I.connectedPeers[peerId].onSendChannelOpen)
                    I.connectedPeers[peerId].onSendChannelOpen();
            };

            peer.sendChannel.onclose = function() {
                I.issueStatusUpdate(I, PeerCommunication.COMM_STATUS.PEER_SEND_CHANNEL_STATUS + peerId + " CLOSED ");
            };

            return peer;

	    },

        /**
         * Initialization of all properties of the PeerCommunication Object
         * @inner
         * @memberOf PeerCommunication
         */
        init : function() {
            const I = this;
            // this is relavent to the callback functions
            try {
                this.ssConn = new WebSocket(this.config.ssAddress);
                // we attempt to login to the server
                this.ssConn.onopen = function() {
                    I.loginToSS(I);
                };
                this.ssConn.onmessage = function(msg) {
                    I.onSSMessage(I, msg);
                    // message handlerf
                };
                this.ssConn.onerror = function(err) {
                    //console.error(err); //TODO: what are the possible other errors!
                    I.onSSError(I, PeerCommunication.ERROR.SERVER_NA);
                    // error handler
                };
                this.ssConn.onclose = function(evt) {
                    // create a new websocket and try to connect agains
                    setTimeout(function() {
                        I.init();
                    }, 1000)
                }
            } catch(ex) {
                // TODO: LOG_ERR
                this.issueStatusUpdate(this, "Could not connect to the signaling server: " + ex);
                //TODO: not sure this is a good idea to call the method this way!
            }
        }
    };

    function log(caller, obj){

        console.log("%c ***** [%s] %o ", 'color: #FFA500', caller, obj);

    }

    /*
    Export the module for various environments.
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PeerCommunication;
    } else if (typeof exports !== 'undefined') {
        exports.PeerCommunication = PeerCommunication;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return PeerCommunication;
        });
    } else {
        root.PeerCommunication = PeerCommunication;
    }

})(this);
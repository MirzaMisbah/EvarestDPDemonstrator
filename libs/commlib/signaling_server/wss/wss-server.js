/**
 * We want the server to run over https
 *
 */

'use strict';

const https = require('https');
const fs = require('fs');

const WebSocket = require('ws'); //ws

const PATH = "/etc/letsencrypt/live/service-tucana.de";

// interval (in seconds) to ping peers to see if they are alive
const PING_INTERVAL = 5;

// WS status codes
const WS_NORMAL_CLOSURE = 1000;
const WS_GOING_AWAY = 1001;

// We create an HTTPS server
const httpsServer = https.createServer({
	cert: fs.readFileSync(PATH + '/cert.pem', 'utf8'),
	key: fs.readFileSync(PATH + '/privkey.pem', 'utf8')

});
httpsServer.listen(9091);

// We create a websocket
const wss = new WebSocket.Server({
	server: httpsServer,
});


var moment = require('moment');
const TS_FORMAT = 'DD.MM.YY HH:mm:ss';



//all connected to the server users
var users = {};
var properties = [];

// a buffer for signalling server msgs if the receiver of these msgs loses connection to the signalling server
var buffered_msgs = {};

const ServerMsgs = {
	LOGIN: "login",
	OFFER: "offer",
	ANSWER: "answer",
	CANDIDATE: "candidate",
	LEAVE: "leave",
	ERROR: "error",
	FILTER: 'filter',
	ERR_USERNA: "USER_NA",
	ERR_COMMANDNA: "COMMAND_NA",
	ERR_NOTLOGGEDIN: "NOT_LOGGED_IN",
	PROPERTIES: "properties"
};

function log(peerId, msg, targetPeer) {
	console.log(moment().format(TS_FORMAT), peerId, msg, targetPeer);
}

function heartbeat() {
	this.isAlive = true;
}

//when a user connects to our sever
wss.on('connection', function (connection) {
	connection.isAlive = true;
	connection.on('pong', heartbeat);

	//when server gets a message from a connected user
	connection.on('message', function (message) {
		try {
			var msg;
			//accepting only JSON messages
			try {
				msg = JSON.parse(message);
				/*console.log("Received a Message of type %s from %s", msg.type, msg.from);
				 if (msg.to)
				 console.log("targeting peer with ID %s", msg.to);*/

			} catch (e) {
				console.log("Invalid JSON");
				msg = {};
			}

			//switching type of the user message
			switch (msg.type) {

				//when a user tries to login
				case ServerMsgs.LOGIN:
					log(msg.from, ServerMsgs.LOGIN, "_");
					//if anyone is logged in with this username then refuse
					if (users[msg.from]) {// user name already exists, overwrite it TODO: this is a design decision
						disconnect_user(connection, users);
						/*sendTo(connection, {
						 type : ServerMsgs.LOGIN,
						 success : false
						 });
						 log("SERVER", ServerMsgs.LOGIN + " FALSE ", msg.from);*/
					}
					if (msg.from === "null") {
						sendTo(connection, {
							type: ServerMsgs.LOGIN,
							success: false
						});
						log("SERVER", ServerMsgs.LOGIN + " FALSE ", msg.from);
					}
					else {
						//save user connection on the server
						users[msg.from] = connection;
						properties.push(msg.properties);
						connection.name = msg.from;
						if (msg.properties) {
							connection.properties = msg.properties;
						}
						connection.connectedPeers = [];
						sendTo(connection, {
							type: ServerMsgs.LOGIN,
							success: true
						});
						log("SERVER", ServerMsgs.LOGIN + " TRUE ", msg.from);

						// if there are any buffered msgs for this peer, forward them
						if (msg.from in buffered_msgs) {
							while (buffered_msgs[msg.from].length > 0) {
								var buffered_msg = buffered_msgs[msg.from].splice(0, 1);

								sendTo(connection, {
									type: ServerMsgs.OFFER,
									offer: buffered_msg[0].content,
									from: buffered_msg[0].from
								});

								log(msg.from, ServerMsgs.OFFER, msg.to);
							}
						}

						break;
					}
				case ServerMsgs.OFFER:
					//if UserB exists then send him offer details
					var conn = users[msg.to];

					if (conn != null && connection.connectedPeers) {
						//setting that UserA connected with UserB
						connection.connectedPeers.push(msg.to);

						try {
							sendTo(conn, {
								type: ServerMsgs.OFFER,
								offer: msg.content,
								from: msg.from
							});
							log(msg.from, ServerMsgs.OFFER, msg.to);
						} catch (err) {
							// buffer the offer if the conn is not open. should not reach in normal operation
							// only for the case of mobile data disconnection. in this case, bookkeeping may
							// go wrong and conn might not be null
							push_to_buffer(msg, msg.to);
						}

					} else if (conn == null) {
						/*sendTo(connection, {
							type : ServerMsgs.ERROR,
							error : ServerMsgs.ERR_USERNA
						});
						log("SERVER", ServerMsgs.OFFER + " " + ServerMsgs.ERR_USERNA, msg.from);*/

						// buffer the offer. it could be that the peer will come back online again
						push_to_buffer(msg, msg.to);
					} else {
						sendTo(connection, {
							type: ServerMsgs.ERROR,
							error: ServerMsgs.ERR_NOTLOGGEDIN
						});
						log("SERVER", ServerMsgs.OFFER + " " + ServerMsgs.ERR_NOTLOGGEDIN, msg.from);
					}
					break;

				case ServerMsgs.ANSWER:

					//for ex. UserB answers UserA
					var conn = users[msg.to];
					if (conn != null && connection.connectedPeers) {
						connection.connectedPeers.push(msg.to);
						sendTo(conn, {
							type: ServerMsgs.ANSWER,
							answer: msg.content,
							from: msg.from
						});
						log(msg.from, ServerMsgs.ANSWER, msg.to);
					} else if (conn == null) {
						/*sendTo(connection, {
							type : ServerMsgs.ERROR,
							error : ServerMsgs.ERR_USERNA
						});
						log("SERVER", ServerMsgs.ANSWER + " " + ServerMsgs.ERR_USERNA, msg.from);*/

						// buffer the offer. it could be that the peer will come back online again
						push_to_buffer(msg, msg.to);
					} else {
						sendTo(connection, {
							type: ServerMsgs.ERROR,
							error: ServerMsgs.ERR_NOTLOGGEDIN
						});
						log("SERVER", ServerMsgs.ANSWER + " " + ServerMsgs.ERR_NOTLOGGEDIN, msg.from);
					}

					break;

				case ServerMsgs.CANDIDATE:
					var conn = users[msg.to];

					if (conn != null && connection.connectedPeers) {
						sendTo(conn, {
							type: ServerMsgs.CANDIDATE,
							candidate: msg.content,
							from: msg.from
						});
						log(msg.from, ServerMsgs.CANDIDATE, msg.to);
					} else if (conn == null) {
						sendTo(connection, {
							type: ServerMsgs.ERROR,
							error: ServerMsgs.ERR_USERNA
						});
						log("SERVER", ServerMsgs.CANDIDATE + " " + ServerMsgs.ERR_USERNA, msg.from);
					} else {
						sendTo(connection, {
							type: ServerMsgs.ERROR,
							error: ServerMsgs.ERR_NOTLOGGEDIN
						});
						log("SERVER", ServerMsgs.CANDIDATE + " " + ServerMsgs.ERR_NOTLOGGEDIN, msg.from);
					}

					break;

				case ServerMsgs.PROPERTIES:
					var filteredId = [];
					for (var i = 0; i < properties.length; i++) {
						var flag = false;
						var flag2 = false;
						var flag3 = false;

						if (msg.content.properties[1] == properties[i].producer && msg.content.properties[2] == properties[i].provider
							&& msg.content.properties[3] == properties[i].guest) {
							flag = true;
						}
						for (var k = 0; k < msg.content.properties[5].length; k++) {
							if (properties[i].keywords == msg.content.properties[5][k]) {
								flag2 = true;
							}
						}
						for (var k = 0; k < msg.content.properties[6].length; k++) {
							if (properties[i].name == msg.content.properties[6][k]) {
								flag3 = true;
							}
						}
						if ((flag == true && flag2 == true && flag3 == true) &&
							properties[i].localId != msg.from) {
							filteredId.push(properties[i].localId);
						}

					}
					console.log("FILTER ", filteredId);
					if (filteredId.length == 0) {
						sendTo(connection, {
							id: msg.content.id,
							type: ServerMsgs.PROPERTIES,
							content: "USER_NA"
						});

					}
					else {
						sendTo(connection, {
							id: msg.content.id,
							type: ServerMsgs.PROPERTIES,
							content: filteredId
						});
					}

					break;


				case ServerMsgs.LEAVE:
					var conn = users[msg.from];
					delete users[msg.from];
					removeProperty(msg.from);
					if (conn != null) {
						disconnect_user(conn, users);
					}
					// discard buffered msgs to be sent to this peer (if any)
					buffered_msgs[msg.from] = [];
					break;
				default:
					sendTo(connection, {
						type: ServerMsgs.ERROR,
						error: ServerMsgs.ERR_COMMANDNA
					});

					break;

			}
		} catch (err) {
			console.log(err);
		}
	});

	//when user exits, for example closes a browser window
	//this may help if we are still in "offer","answer" or "candidate" state  // TODO: this code is duplicated it is the same for the LEAVE message
	connection.on("close", function (evnt) {
		try {
			if (evnt == WS_NORMAL_CLOSURE || evnt == WS_GOING_AWAY) {
				if (connection.name) {
					// 1. delete user
					delete users[connection.name];
					removeProperty(connection.name);
					// 2. if the user has connected peers, notify them that he is leaving
					disconnect_user(connection, users);
					// 3. if there are any buffered messages to be sent to this peer, discard them
					buffered_msgs[connection.name] = [];
				}
			}
		} catch (err) {
			console.error(err);
		}
	});

	sendTo(connection, {
		type: "greetings",
		success: true
	});

});

function disconnect_user(connection, users) {
	if (connection.connectedPeers) {
		log(connection.name, ServerMsgs.LEAVE, connection.connectedPeers);
		for (var i = 0; i < connection.connectedPeers.length; i++) {
			var peer = connection.connectedPeers[i];
			var peerConn = users[peer];
			if (peerConn != null) {
				// remove it from their list of connections
				removeProperty(connection.name);
				const index = peerConn.connectedPeers.indexOf(connection.name);
				peerConn.connectedPeers.splice(index, 1);
				sendTo(peerConn, {// send them the message
					from: connection.name,
					type: ServerMsgs.LEAVE
				});
			}
		}//for
	}

}

function sendTo(connection, message) {
	try {
		connection.send(JSON.stringify(message));
	} catch (e) {
		return;
	}
}

// buffers the msg to be sent to receiver
function push_to_buffer(msg, receiver) {
	if (!(receiver in buffered_msgs)) {
		buffered_msgs[receiver] = [];
	}

	buffered_msgs[receiver].push(msg);
}



function removeProperty(id){
        var index = 0;
	for (index = 0 ; index < properties.length ; index++){
             if(properties[index] && properties[index].localId == id){
  	        console.log("index from properties removed : ", index, " for id " ,id  ); 
                properties.splice(index, 1);
               }
            }
    }

function noop() { }

// sends a ping every PING_INTERVAL seconds to check if the peer is alive

// first, traverse the clients and look for duplicates.
// then, if there are duplicates, don't
// delete the user (this is done only for the special case of switching b/w
// networks i.e. mobile and wifi). if there are no duplicates, delete users[] entry
// this is done because when there is a network shift, the user logs in instantly and
// a duplicate entry for the user gets created in users[]
const interval = setInterval(function ping() {
	var duplicate = {};
	// first iter
	wss.clients.forEach(function each(ws) {
		if (!(ws.name in duplicate)) {
			duplicate[ws.name] = false;
		} else {
			duplicate[ws.name] = true;
		}
	});

	// second iter
	wss.clients.forEach(function each(ws) {
		// if peer is not alive, delete it and terminate the connection
		if (ws.isAlive === false) {
			if (ws.name in duplicate) {
				if (duplicate[ws.name] == false) {
					delete users[ws.name];
					removeProperty(ws.name);
				}
			}

			log("SERVER", "Terminating conn due to no response from peer", ws.name);
			ws.terminate();
			return;
		}

		ws.isAlive = false;
		ws.ping(noop);
	});
}, PING_INTERVAL * 1000);

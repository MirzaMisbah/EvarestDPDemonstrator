//require our websocket library
var WebSocketServer = require('ws').Server;
var moment = require('moment');
const TS_FORMAT = 'DD.MM.YY HH:mm:ss';

//creating a websocket server at port 9090
var wss = new WebSocketServer({
	port : 9090
});

//all connected to the server users
var users = {};

const ServerMsgs = {
	LOGIN : "login",
	OFFER : "offer",
	ANSWER : "answer",
	CANDIDATE : "candidate",
	LEAVE : "leave",
	ERROR : "error",
	ERR_USERNA : "USER_NA",
	ERR_COMMANDNA : "COMMAND_NA",
	ERR_NOTLOGGEDIN : "NOT_LOGGED_IN"
};

function log(peerId, msg, targetPeer) {
	console.log(moment().format(TS_FORMAT), peerId, msg, targetPeer);
}

console.log("Server Started at: ", moment().format(TS_FORMAT));
//when a user connects to our sever
wss.on('connection', function(connection) {

	//when server gets a message from a connected user
	connection.on('message', function(message) {
		try {
			var msg;
			//accepting only JSON messages
			try {
				msg = JSON.parse(message);
				console.log("msg");
				console.log(msg);
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
				//save user connection on the server
				users[msg.from] = connection;
				connection.name = msg.from;
				connection.connectedPeers = [];
				sendTo(connection, {
					type : ServerMsgs.LOGIN,
					success : true
				});
				log("SERVER", ServerMsgs.LOGIN + " TRUE ", msg.from);

				break;

			case ServerMsgs.OFFER:
				console.log("offer called");
				//if UserB exists then send him offer details
				var conn = users[msg.to];

				if (conn != null && connection.connectedPeers) {
					//setting that UserA connected with UserB
					connection.connectedPeers.push(msg.to);

					sendTo(conn, {
						type : ServerMsgs.OFFER,
						offer : msg.content,
						from : msg.from
					});
					log(msg.from, ServerMsgs.OFFER, msg.to);

				} else if (conn == null) {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_USERNA
					});
					log("SERVER", ServerMsgs.OFFER + " " + ServerMsgs.ERR_USERNA, msg.from);
				} else {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_NOTLOGGEDIN
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
						type : ServerMsgs.ANSWER,
						answer : msg.content,
						from : msg.from
					});
					log(msg.from, ServerMsgs.ANSWER, msg.to);
				} else if (conn == null) {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_USERNA
					});
					log("SERVER", ServerMsgs.ANSWER + " " + ServerMsgs.ERR_USERNA, msg.from);
				} else {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_NOTLOGGEDIN
					});
					log("SERVER", ServerMsgs.ANSWER + " " + ServerMsgs.ERR_NOTLOGGEDIN, msg.from);
				}

				break;

			case ServerMsgs.CANDIDATE:
				var conn = users[msg.to];

				if (conn != null && connection.connectedPeers) {
					sendTo(conn, {
						type : ServerMsgs.CANDIDATE,
						candidate : msg.content,
						from : msg.from
					});
					log(msg.from, ServerMsgs.CANDIDATE, msg.to);
				} else if (conn == null) {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_USERNA
					});
					log("SERVER", ServerMsgs.CANDIDATE + " " + ServerMsgs.ERR_USERNA, msg.from);
				} else {
					sendTo(connection, {
						type : ServerMsgs.ERROR,
						error : ServerMsgs.ERR_NOTLOGGEDIN
					});
					log("SERVER", ServerMsgs.CANDIDATE + " " + ServerMsgs.ERR_NOTLOGGEDIN, msg.from);
				}

				break;

			case ServerMsgs.LEAVE:
				var conn = users[msg.from];
				delete users[msg.from];
				if (conn != null) {
					disconnect_user(conn, users);
				}
				break;
			default:
				sendTo(connection, {
					type : ServerMsgs.ERROR,
					error : ServerMsgs.ERR_COMMANDNA
				});

				break;

			}
		} catch(err) {
			console.log(err);
		}
	});

	//when user exits, for example closes a browser window
	//this may help if we are still in "offer","answer" or "candidate" state  // TODO: this code is duplicated it is the same for the LEAVE message
	connection.on("close", function() {
		try {
			// 1. remove user from the server list
			if (connection.name) {
				delete users[connection.name];
				// 2. if the user has connected peers, notify them that he is leaving
				disconnect_user(connection, users);
			}
		} catch(err) {
			console.error(err);
		}
	});

	sendTo(connection, {
		type : "greetings",
		success : true
	});

});

function disconnect_user(connection, users) {
	console.log("disconnect user called");
	if (connection.connectedPeers) {
		log(connection.name, ServerMsgs.LEAVE, connection.connectedPeers);
		for (var i = 0; i < connection.connectedPeers.length; i++) {
			var peer = connection.connectedPeers[i];
			var peerConn = users[peer];
			if (peerConn != null) {
				// remove it from their list of connections
				const index = peerConn.connectedPeers.indexOf(connection.name);
				peerConn.connectedPeers.splice(index, 1);
				sendTo(peerConn, {// send them the message
					from : connection.name,
					type : ServerMsgs.LEAVE
				});
			}
		}//for
	}

}

function sendTo(connection, message) {
	connection.send(JSON.stringify(message));
}

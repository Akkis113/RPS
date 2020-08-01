'use strict';

// process identifier for 'ps' or 'top' like utilities
process.title = 'BicastR server';

// port of websocket server
var websocketPort = process.env.PORT || 3000;

var websocketServer = require('websocket').server;
var http = require('http');

// list of pairs
var pairs = {};
const clients = []

/**
 * HTTP server
 */
var server = http.createServer(function (request, response) {
	// no need to do anything here	
});

server.listen(websocketPort, function () {
	console.log((new Date()) + " Server is listening on port " + websocketPort);
});

/**
 * WebSocket server
 */
var wsServer = new websocketServer({
	httpServer: server
});

var num_client = 0;
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {

	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	// accept connection
	var connection = request.accept(null, request.origin);
	console.log((new Date()) + ' Connection accepted');

	// parsing client data
	clients.push(connection);
	connection.on('message', function (message) {
		// connection.send(JSON.stringify(message.utf8Data));
		const data = JSON.parse(message.utf8Data)
		if (data.type === 'create code') {
			const gameCode = Math.floor(Math.random() * 1000000)
			while (pairs[gameCode] !== undefined) {
				gameCode = Math.floor(Math.random() * 1000000)
			}
			pairs[gameCode] = [connection]
			connection.sendUTF(JSON.stringify({ type: 'game code', code: gameCode }))
		}
		else if (data.type === 'join code') {
			const gameCode = data.code
			if (pairs[gameCode] === undefined) {
				connection.sendUTF(JSON.stringify({ type: 'error', e: 'invalid game code' }))
			}
			else if (pairs[gameCode].length === 2) {
				connection.sendUTF(JSON.stringify({ type: 'error', e: 'game code expired' }))
			}
			else {
				pairs[gameCode].push(connection)
				pairs[gameCode][0].gameCode = gameCode
				pairs[gameCode][1].gameCode = gameCode
				pairs[gameCode][0].sendUTF(JSON.stringify({ type: 'paired' }))
				pairs[gameCode][1].sendUTF(JSON.stringify({ type: 'paired' }))
			}
		}
		else if (data.type === 'choice') {
			const gameCode = connection.gameCode
			connection.choice = data.choice
			if (pairs[gameCode][0] === connection) {
				pairs[gameCode][1].sendUTF(JSON.stringify({ type: 'opponentOption', choice: connection.choice }))
			}
			else if (pairs[gameCode][1] === connection) {
				pairs[gameCode][0].sendUTF(JSON.stringify({ type: 'opponentOption', choice: connection.choice }))
			}
			else {
				connection.sendUTF(JSON.stringify({ type: 'error', e: 'something went wrong' }))
			}
		}
		else if (data.type === 'replay') {
			const gameCode = connection.gameCode
			if ((pairs[gameCode].length === 2) && ((pairs[gameCode][0] === connection) || (pairs[gameCode][1] === connection))) {
				pairs[gameCode][0].choice = undefined
				pairs[gameCode][1].choice = undefined
				pairs[gameCode][0].sendUTF(JSON.stringify({ type: 'paired' }))
				pairs[gameCode][1].sendUTF(JSON.stringify({ type: 'paired' }))
			} else {
				connection.sendUTF(JSON.stringify({ type: 'error', e: 'invalid game code' }))
			}
		}
	});

	// client disconnected
	connection.on('close', function (connection) {
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});
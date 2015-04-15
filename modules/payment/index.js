var WebSocketServer = require('ws').Server,
	request = require("request"),
	fs = require("fs"),
	socketsIo = require('socket.io');

var GALLERIES_PATH = "/public/galleries/";

exports.register = function (server, options, next) {

	var clientList = [];
	GALLERIES_PATH = options.basePath + GALLERIES_PATH;

	var io = socketsIo.listen(server.listener);

	io.sockets.on('connection', function (socket) {

		var clientId = Math.random().toString(36).slice(2);

		socket.emit("client", { clientId: clientId });
		console.log("emmitted");

		clientList[clientId] = socket;

		socket.on("close", function() {
			console.log("Disonnected", clientId);
			delete clientList[clientId];
		});

	});

	server.route({
	    method: 'GET',
	    path: '/generate/{galleryId}/{clientId}',
	    handler: function (req, reply) {
	    	var callbackUrl = options.callbackUrl.replace("{galleryId}", req.params.galleryId).replace("{clientId}", req.params.clientId);
			request('https://blockchain.info/api/receive?method=create&address=' + options.recipient + '&callback=' + callbackUrl,
				function (error, response, body) {

				if (error) {
					console.log(error);
					return;
				}

				if (response.statusCode == 200) {
			    	body = JSON.parse(body);
			    	console.log(body);
			        reply(body);
			        return;
				}

				reply("error");

			});
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/callback/{galleryId}/{clientId}',
	    handler: function (req, reply) {
			console.log(req.params);
			console.log(req.query);
			if (req.query.value > 0) {

				var key = JSON.parse(fs.readFileSync(
					GALLERIES_PATH + "/" + req.params.galleryId + "/key.json"
				));

				if (clientList[req.params.clientId]) {
					var message = {
						value: req.query.value,
						done: true,
						key: key
					};
					clientList[req.params.clientId].emit("key", message);
				}

				reply("*ok*");
				return;

			}

			reply("*not ok, empty amount*");

	    }
	});

};

exports.register.attributes = {
    pkg: require('./package.json')
};

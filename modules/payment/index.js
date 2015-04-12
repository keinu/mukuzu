var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port: 8000 }),
	request = require("request"),
	fs = require("fs");

exports.register = function (server, options, next) {

	var clientList = [];
	wss.on('connection', function connection(ws) {

		var clientId = ws.upgradeReq.url.substring(1);
		console.log(clientId);

		clientList[clientId] = ws;

		ws.on('message', function incoming(message) {
			console.log('received: %s by %s', message, clientId);
		});

		ws.on('close', function close() {
			console.log('%s disconnected', clientId);
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

				var key = JSON.parse(fs.readFileSync("public/images/key.json"));
				if (clientList[req.params.clientId]) {
					var message = {
						value: req.query.value,
						done: true,
						key: key
					};
					clientList[req.params.clientId].send(JSON.stringify(message));
				}
				reply("*ok*");

			}
	    }
	});

};

exports.register.attributes = {
    pkg: require('./package.json')
};
var Rdio = require('rdio')({
  rdio: {
    clientId: process.env.RDIO_ID,
    clientSecret: rocess.env.RDIO_SECRET
  }
});
var rdio = new Rdio();

exports.register = function (server, options, next) {

	server.route({
	    method: 'GET',
	    path: '/',
	    handler: function(request, reply) {

			rdio.getClientToken(function(err) {

				if (err) {
					console.log(err);
					return reply(err);
				}

				rdio.request({
					method: 'getFavorites',
					user: "s3050133"
				}, false, function(err, response) {

					if (err) {
						return reply(err);
					}

					reply(response);

				});

			});

		}

	});

};


exports.register.attributes = {
    pkg: require('./package.json')
};

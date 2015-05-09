var defaultContext = {
    title: 'Mukuzu, the sandpit'
};

var Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    port: process.env.NODE_PORT || 8080,
    routes: {
        cors: {
            origin: ["*keinu.net", "*punttu.com", "*127.0.0.1*", "*localhost*"],
            isOriginExposed: false
        }
    }
});

// Add the route
server.route({
    method: 'GET',
    path:'/hello',
    handler: function (request, reply) {
       reply('hello world');
    }
});

server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './views',
    layoutPath: './views/layout',
    helpersPath: './views/helpers'
});

// load one plugin
server.register({
		register: require('./modules/payment'),
		options: {
			recipient: process.env.BTC_ADDR || "1LfP5qTTyxrPNWKxRUU5auDDTfBejh1sQ7",
			callbackUrl: "http://www.mukuzu.com/payment/callback/{galleryId}/{clientId}",
			basePath: __dirname
		}
	},
	{
		routes: {
			prefix: '/payment'
		}
	},
	function (err) {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    }
);

server.register({
        register: require('./modules/galleries'),
        options: {
            basePath: __dirname
        }
    },
    {
        routes: {
            prefix: '/gallery'
        }
    },
    function (err) {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    }
);

server.register({
        register: require('./modules/contact')
    },
    {
        routes: {
            prefix: '/contact'
        }
    },
    function (err) {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    }
);

server.register({
        register: require('./modules/domain')
    },
    {
        routes: {
            prefix: '/domain'
        }
    },
    function (err) {
        if (err) {
            console.error('Failed to load plugin:', err);
        }
    }
);

// Start the server
server.start();

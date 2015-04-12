var request = require("request"),
	async = require("async"),
	Ns = require('namecheap-checker'),
	Joi = require('joi');
	Datastore = require('nedb');


exports.register = function (server, options, next) {

	var checker = new Ns(process.env.NC_USER, process.env.NC_KEY, process.env.NC_IP);
	var tlds = ["com", "net", "org", "fr", "es"];
	var db = new Datastore();

	var isCached = function(domain, callback) {

		var cutoffDate = new Date();
			cutoffDate.setMinutes(cutoffDate.getMinutes() - 10);

		db.find({
			domain: domain,
			time: {
				$gte: cutoffDate
			}
		}).limit(1).exec(function (err, response) {

			if (response.length > 0) {
				callback(null, response[0].response);
				return;
			}

			// No cache
			callback();

		});

	};

	var checkNamecheap = function(domain, callback) {

		var domains = [];
		tlds.forEach(function(tld) {
			domains.push(domain + "." + tld);
		});

		checker.checkDomains(domains, function(err, result) {

			if (err) {
				callback(err, "Namecheap");
				console.log(err);
				return;
			}

			callback(null, result);

		});

	};

	var checkDomeinuak = function(domain, callback) {

		request.post("http://www.domeinuak.eus/whois/", {
			form: {domeinua: domain},
			headers: {
				'Cache-Control': 'no-cache',
				'User-Agent': 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:36.0) Gecko/20100101 Firefox/36.0'
			}
		}, function (err, result, body) {

			if (err) {
				callback(err, "Domeinuak");
			}

		    callback(null, [{
		    	domain: domain + ".eus",
		    	available: (body === "1") ? true : false
		    }]);

		});

	};

	var checkDomain = function(domain, callback) {

		var response = [];
		async.parallel([
		    async.apply(checkNamecheap, domain),
		    async.apply(checkDomeinuak, domain),
		], function(err, data) {

			data.forEach(function(provider) {
				if (provider.length === 1) {
					response.unshift(provider);
				} else {
					response = response.concat(provider);
				}
			});

			var call = {
				time: new Date(),
				domain: domain,
				response: response
			};

			db.insert(call, function (err, doc) {});
			callback(response);

		});

	};

	server.route({
	    method: 'GET',
	    path: '/check/{domain}',
		config: {
			validate: {
				params: {
					domain: Joi.string().min(3).max(30)
				}
			}
		},
	    handler: function (request, reply) {

			isCached(request.params.domain, function(err, response) {

				if (response) {
					reply(response);
				} else {
					checkDomain(request.params.domain, function(response) {
						reply(response);
					});
				}

			});

	    }

	});

};

exports.register.attributes = {
    pkg: require('./package.json')
};

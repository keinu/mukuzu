var AWS = require('aws-sdk'),
	s3 = new AWS.S3();

var uploader = require("./uploader.js");
var keyService = require("../../services/key/index.js");

var rootURL = "https://s3-eu-west-1.amazonaws.com/mukuzuimagesencrypted/",
	expires = 2; //minutes

exports.register = function (server, options, next) {

	server.route({
		method: 'POST',
		path: '/upload',
		config: {
			payload: {
				maxBytes: 209715200,
				output:'stream',
				parse: true
			}
		},
		handler: function (request, reply) {

			var files = request.payload.file;

			var galleryId = Math.random().toString(36).slice(2);

			keyService.create(galleryId, expires).then(function(key) {

				return keyService.store(key);

			}).then(function(key) {

				if (files.length) {
					files.forEach(function(file) {
						uploader.uploadFile(file, key.galleryId);
					});
				} else {
					uploader.uploadFile(files, key.galleryId);
				}

			}).done(function() {

				reply("done");

			});

		}

	});

	server.route({
	    method: 'GET',
	    path: '/list',
	    handler: function (req, reply) {

		    s3.listObjects({
				Bucket: "mukuzuimagesencrypted",
				Delimiter: "-"
			},
			function(err, data) {

				if (err) {
					throw err;
				}

				var galleries = [];
				data.CommonPrefixes.forEach(function(prefix) {
					galleries.push(prefix.Prefix.split("-")[0]);
				});

				reply(galleries);

				console.log(JSON.stringify(data, null, 2));

			});

		}

	});

	server.route({
	    method: 'GET',
	    path: '/{galleryId}/list',
	    handler: function (request, reply) {

	    	s3.listObjects({
				Bucket: "mukuzuimagesencrypted",
				Prefix: request.params.galleryId
			},
			function(err, data) {

				if (err) {
					return reply(err);
				}

				var images = [];
				data.Contents.forEach(function(image) {
					images.push(rootURL + image.Key);
				});

				reply(images);

				console.log(JSON.stringify(data, null, 2));

			});

	    }

	});

	server.route({
	    method: 'GET',
	    path: '/{galleryId}/key',
	    handler: function (request, reply) {

	    	keyService.get(request.params.galleryId).then(function(key) {

				reply(key);

	    	}).fail(function(err) {

	    		reply(err);

	    	});

	    }

	});
};

exports.register.attributes = {
    pkg: require('./package.json')
};
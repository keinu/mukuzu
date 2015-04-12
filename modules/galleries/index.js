var fs = require("fs"),
	gm = require('gm'),
	CryptoJS = require("crypto-js"),
    SEPARATOR = "+FFFFFF+",
    ORIGINALS_PATH = "/public/originals/",
    GALLERIES_PATH = "/public/galleries/",
    PUBLIC_GALLERIES_PATH = "/public/galleries/",
    TMP_PATH = "/public/tmp/";

exports.register = function (server, options, next) {

	ORIGINALS_PATH = options.basePath + ORIGINALS_PATH;
	GALLERIES_PATH = options.basePath + GALLERIES_PATH;
	TMP_PATH       = options.basePath + TMP_PATH;

	var encryptImage = function(key, file) {

		var data = fs.readFileSync(file);
		var base64data = new Buffer(data).toString('base64');
		var wordArray = CryptoJS.enc.Base64.parse(base64data);
		return CryptoJS.AES.encrypt(wordArray, key);

	};

	var degradeImage = function(galleryNumber, file, callback) {

		var tmpFile = TMP_PATH + galleryNumber + "/" + file;
		console.log("tmp path", tmpFile);

		gm(ORIGINALS_PATH + galleryNumber + "/" + file)
			.blur(20, 20)
			.quality(1)
			.write(TMP_PATH + file, function(e) {
				var data = fs.readFileSync(TMP_PATH + file);
				callback(new Buffer(data).toString('base64'));
		});

	};

	var combineImage = function(degraded, encrypted) {

		return degraded + SEPARATOR + encrypted;

	};

	var findGalleries = function(path) {

		var galleries = [];
		fs.readdirSync(path).forEach(function(directory) {
			if (fs.lstatSync(path + directory).isDirectory()) {
				galleries.push(path + directory + "/");
			}
		});

		return galleries;

	};

	var encryptGallery = function(galleryNumber) {

		var detinationPath = GALLERIES_PATH  + galleryNumber + "/";
		console.log("Will create a gallery at", detinationPath);

		if (!fs.existsSync(detinationPath)) {
			fs.mkdirSync(detinationPath);
		}

		var key = {
			value: Math.random().toString(36).slice(2),
			date: (new Date()).getTime(),
			validity: (new Date(0)).setMinutes(10), //10 minutes
			galleryId: galleryNumber
		};


		var fileNumber = 1;
		var galleryPath = ORIGINALS_PATH + galleryNumber + "/";
		var files = fs.readdirSync(ORIGINALS_PATH + galleryNumber);
		files.forEach(function(file) {

			if (fs.lstatSync(galleryPath + file).isDirectory())
				return true;

			if (file.indexOf(".") === 0)
				return;

			var encrypted = encryptImage(key.value, galleryPath + file);

			degradeImage(galleryNumber, file, function(data) {

				console.log("file", file);
				var combined = combineImage(data, encrypted);
				fs.writeFileSync(detinationPath + fileNumber++ + ".jpg", combined, "base64");

			});

		});


		fs.writeFileSync(detinationPath + "key.json", JSON.stringify(key));


	};


	server.route({
	    method: 'GET',
	    path: '/encrypt/',
	    handler: function (req, reply) {

			var galleryNumber = 1;
			findGalleries(ORIGINALS_PATH).forEach(function(gallery) {
				encryptGallery(galleryNumber++);
				reply("done");
			});

	    }
	});

	server.route({
	    method: 'GET',
	    path: '/{galleryId}/encrypt',
	    handler: function (req, reply) {
			encryptGallery(req.params.galleryId);
			reply("done");
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/{galleryId}',
	    handler: function (req, reply) {

			var galleryPath = GALLERIES_PATH + req.params.galleryId + "/";
			var publicFiles = [];

			fs.readdir(galleryPath, function(err, files) {

				files.forEach(function(file) {

					if (fs.lstatSync(galleryPath + file).isDirectory())
						return true;

					if (file.indexOf(".") === 0)
						return;

					if (file.indexOf(".json") >= 0)
						return;

					publicFiles.push(PUBLIC_GALLERIES_PATH + req.params.galleryId + "/" + file);

				});

				reply(publicFiles);

			});

		}

	});

	server.route({
	    method: 'GET',
	    path: '/{galleryId}/key',
	    handler: function (request, reply) {
	    	var key = fs.readFileSync(GALLERIES_PATH + request.params.galleryId + "/key.json");
	        reply(JSON.parse(key));
	    }
	});

};

exports.register.attributes = {
    pkg: require('./package.json')
};
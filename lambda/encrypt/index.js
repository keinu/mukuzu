var AWS = require('aws-sdk'),
	util = require('util'),
	s3 = new AWS.S3();

var encrypter = require("./encrypter");
var fileHandler = require("./fileHandler");

exports.handler = function(event, context) {

	console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

	// Sanitize
    var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " ")),
		typeMatch = srcKey.match(/\.([^.]*)$/);

	if (!typeMatch) {
		return console.error('unable to infer image type for key ' + srcKey);
	}

	var imageType = typeMatch[1];
	if (imageType != "jpg" && imageType != "png") {
		return console.log('skipping non-image ' + srcKey);
	}

	var keyfile;

	fileHandler.getKey(srcKey).then(function(key) {

		console.log("Fetching image key is");
		keyFile = JSON.parse(key.toString());
		return fileHandler.getFile(srcKey);

	}).then(function(data) {

		console.log("Got the image, encrypt");
		return encrypter.createHybridImage(data, keyFile.value);

	}).then(function(data) {

		console.log("encryptiong done");
		return fileHandler.putFile(srcKey, data, "image/jpg", "mukuzuimagesencrypted");

	}).then(function() {

		console.log("deleting source file");
		return fileHandler.deleteFile(srcKey);

	}).fail(function(err) {

		console.error(err);

	}).done(function() {

		console.log("All done");
		context.done();

	});

};
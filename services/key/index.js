var AWS = require('aws-sdk'),
	s3 = new AWS.S3(),
	Q = require("q");

module.exports = (function(){

	var sourceBucket = "mukuzuimages";

	var create = function(galleryId, expiry) {

		return Q.fcall(function() {

			var key = {
				value: Math.random().toString(36).slice(2),
				date: (new Date()).getTime(),
				validity: (new Date(0)).setMinutes(expiry),
				galleryId: galleryId
			};

			return key;

		});


	};

	var store = function(key) {

		var deferred = Q.defer();

		var s3 = new AWS.S3();
		var upload = s3.putObject({
			"Bucket": sourceBucket,
			"Key": key.galleryId + "-key.json",
			"Body": JSON.stringify(key, null, 2)
		}, function(err, data) {

			if (err) {
				deferred.reject(err);
				return;
			}

			deferred.resolve(key);

		});

		return deferred.promise;

	};

	var get = function(galleryId) {

		var deferred = Q.defer();

		s3.getObject({
			Bucket: sourceBucket,
			Key: galleryId + "-key.json",
		},
		function(err, data) {

			if (err) {
				deferred.reject(err);
				return;
			}

			deferred.resolve(JSON.parse(data.Body.toString()));

		});

		return deferred.promise;

	};

	return {
		create: create,
		store: store,
		get: get
	};

})();
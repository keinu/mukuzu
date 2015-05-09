var Q = require("q"),
	AWS = require('aws-sdk'),
	s3 = new AWS.S3();

var sourceBucket = "mukuzuimages";

module.exports = (function() {


	var getKey = function(fileName) {

		var galleryId = fileName.split("-")[0];
		return getFile(galleryId + "-key.json", sourceBucket);

	};

	var getFile = function(fileName, bucket) {

		var deferred = Q.defer();

		s3.getObject({
			Bucket: bucket || sourceBucket,
			Key: fileName
		},
		function(err, data) {

			if (err) {
				return deferred.reject(err);
			}

			deferred.resolve(data.Body);

		});

		return deferred.promise;

	};

	var putFile = function(fileName, data, type, bucket) {

		var deferred = Q.defer();

		s3.putObject({
			Bucket: bucket || sourceBucket,
			Key: fileName,
			Body: data,
			ContentType: type,
			Expires: new Date().setYear(2222)
		},
		function (err) {

			if (err) {
				return deferred.reject(err);
			}

			deferred.resolve();

		});

		return deferred.promise;

	};

	var deleteFile = function(fileName, bucket) {

		var deferred = Q.defer();

		s3.deleteObject({
			Bucket: bucket || sourceBucket,
			Key: fileName
		},
		function (err) {

			if (err) {
				return deferred.reject(err);
			}

			deferred.resolve();

		});

		return deferred.promise;

	};

	return {

		getKey: getKey,
		getFile: getFile,
		putFile: putFile,
		deleteFile: deleteFile

	};

})();
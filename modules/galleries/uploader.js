var AWS = require('aws-sdk'),
	s3Stream = require('s3-upload-stream')(new AWS.S3()),
	Q = require("q");

var sourceBucket = "mukuzuimages";

module.exports = (function() {

	var uploadFile = function(file, galleryId) {

		var deferred = Q.defer();

		var upload = s3Stream.upload({
			"Bucket": sourceBucket,
			"Key": galleryId + "-" + file.hapi.filename
		});

		// Optional configuration
		upload.maxPartSize(20971520); // 20 MB
		upload.concurrentParts(5);

		upload.on('error', function(err) {
			deferred.reject(err);
		});

		upload.on('part', function(details) {
			deferred.notify(details);
		});

		upload.on('uploaded', function(details) {
			deferred.resolve(details);
		});

		file.pipe(upload);

		return deferred.promise;

	};

	return {
		uploadFile: uploadFile
	};

})();

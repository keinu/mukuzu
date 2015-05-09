var Q = require("q"),
	gm = require('gm').subClass({ imageMagick: true }),
	CryptoJS = require("crypto-js"),
    SEPARATOR = "+FFFFFF+";

module.exports = (function() {

	var encryptImage = function(buffer, key) {

		var base64data = buffer.toString('base64');

		var wordArray = CryptoJS.enc.Base64.parse(base64data);

		return CryptoJS.AES.encrypt(wordArray, key);

	};

	var degradeImage = function(body) {

		var deferred = Q.defer();

		gm(body, "image.jpg")
			.blur(20, 20)
			.quality(1)
			.toBuffer(function(err, buffer) {

				if (err) {
					console.error(err);
					deferred.reject(err);
					return;
				}

				deferred.resolve(buffer);

			});

 		return deferred.promise;

	};

	var combineImages = function(degraded, encrypted) {

		return degraded + SEPARATOR + encrypted;

	};

	var createHybridImage = function(image, key) {

		var encryptedData = encryptImage(image, key);

		return degradeImage(image).then(function(data) {

			console.log("degrade image done");

			var base64Image = combineImages(data.toString("base64"), encryptedData);

			return new Buffer(base64Image, 'base64');

		});

	};

	return {
		createHybridImage: createHybridImage
	};

})();

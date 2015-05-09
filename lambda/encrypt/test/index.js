var encrypter = require("../encrypter");

var con = (function() {

	var done = function() {
		console.log("DONE!");
	};

	return {
		done: done
	};

})();

var fileHandler = require("../index");

fileHandler.handler({
  "Records": [
    {
      "eventVersion": "2.0",
      "eventSource": "aws:s3",
      "awsRegion": "eu-west-1",
      "eventTime": "1970-01-01T00:00:00.000Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": {
        "principalId": "EXAMPLE"
      },
      "requestParameters": {
        "sourceIPAddress": "127.0.0.1"
      },
      "responseElements": {
        "x-amz-request-id": "C3D13FE58DE4C810",
        "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "testConfigRule",
        "bucket": {
          "name": "mukuzuimages",
          "ownerIdentity": {
            "principalId": "EXAMPLE"
          },
          "arn": "arn:aws:s3:::mukuzuimages"
        },
        "object": {
          "key": "yzglhmyujtt9-5.jpg",
          "size": 66471,
          "eTag": "c61b14d7a56576ba76a0116051dee116-1"
        }
      }
    }
  ]
}, con);

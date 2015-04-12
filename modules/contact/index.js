var nodemailer = require('nodemailer'),
	Joi = require('joi');

transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: process.env.GM_USER,
		pass: process.env.GM_PWD
	}
});

exports.register = function (server, options, next) {


	server.route({
	    method: 'POST',
	    path: '/send',
	    config: {
	    	validate: {
	    		payload: {
	    			name: Joi.string().alphanum().min(3).max(30).required(),
	    			email: Joi.string().email().required(),
	    			message: Joi.string().alphanum().min(3).max(3000).required()
	    		}
	    	}
	    },
	    handler: function (request, reply) {

			var mailOptions = {
				from: request.payload.name + " <" + request.payload.email + ">",
				to: "Xabi Errotabehere <xabi@keinu.net>",
				subject: "New message on keinu.net",
				text: request.payload.message
			};

			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
				    console.log(error);
				} else {
				    console.log('Message sent: ' + info.response);
				}
			});

			reply({status: "sent"});

	    }

	});

};

exports.register.attributes = {
    pkg: require('./package.json')
};
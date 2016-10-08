'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sendEmail = undefined;

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendEmail(recipient, subject, content) {

	var transporter = _nodemailer2.default.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PWD
		}
	});

	var mailOptions = {
		from: process.env.EMAIL, // sender address
		to: recipient, // list of receivers
		subject: subject, // Subject line
		text: content //, // plaintext body
		// html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			return error;
			/**res.json({
     success: false,
     reponse: error,
   })**/
		} else {
			return info.response;
			/**res.json({
     success: true,
     reponse: info.response,
   })**/
		};
	});
}
exports.sendEmail = sendEmail;
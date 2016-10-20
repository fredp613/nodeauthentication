"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = isAuthenticated;

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isAuthenticated(mongoose, customOpenPaths) {

	return function (req, res, next) {

		var userAuthOpenPaths = ["/authentication/login", "/authentication/recover", "/authentication/register", "/authentication/recoverconfirm"];
		var openPaths = userAuthOpenPaths.concat(customOpenPaths);
		if (!req.cookies.Token && !openPaths.includes(req.path)) {
			req.isAuthenticated = false;
			res.redirect('/authentication/login');
		} else {
			//get current user, validate token (ensure that it exists and is valid)
			if (req.cookies.Token !== undefined) {
				var token = req.cookies.Token;
				var decoded = _jsonwebtoken2.default.verify(token, 'superSecret');
				var requestingIP = req.headers['x-forwarded-for'];
				var decodedIPs = decoded.IPs;
				console.log(decodedIPs);
				console.log(requestingIP);
				if (decodedIPs.indexOf(requestingIP) !== -1) {
					req.isAuthenticated = true;
					next();
				} else {
					console.log("is not auth");
					req.isAuthenticated = false;
					if (!openPaths.includes(req.path)) {
						res.redirect('/authentication/login');
					} else {
						next();
					}
				}
			} else {
				next();
			}
		}
	};
}
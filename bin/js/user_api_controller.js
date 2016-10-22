'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (router, mongoose, customOpenPaths, rootPath) {

	router.use((0, _authenticate2.default)(mongoose, customOpenPaths));
	rootPath = rootPath + "/api";
	var User = (0, _models.UserModel)(mongoose);
	var PasswordRecovery = (0, _models.PasswordRecoveryModel)(mongoose);
	var loginRoute = rootPath ? rootPath + "/login" : "/login";
	var logoutRoute = rootPath ? rootPath + "/logout" : "/logout";
	var registerRoute = rootPath ? rootPath + "/register" : "/register";
	var recoverRoute = rootPath ? rootPath + "/recover" : "/recover";
	var recoverConfirmRoute = rootPath ? rootPath + "/recoverconfirm" : "/recoverconfirm";

	var saltRounds = 10;
	router.get(loginRoute, function (req, res) {
		res.json({ success: true });
	});

	router.post(loginRoute, function (req, res) {

		var param_email = req.body.email.trim().toLowerCase();
		var param_password = req.body.password;
		var errorMessage = "";

		User.findOne({ email: param_email }, function (err, user) {
			var errorMessage = "";
			var IP = req.headers['x-forwarded-for'];
			if (err) {
				errorMessage = err.Message;
				res.json({ error: errorMessage });
			}
			if (!user) {
				errorMessage = "Invalid email";
				res.json({ error: errorMessage });
			} else {
				_bcrypt2.default.compare(param_password, user.password, function (err, compared) {
					// res == false
					console.log(param_password, user.password, compared);
					if (compared === false || compared === undefined) {
						res.json({ success: false, error: "Password incorrect" });
					} else {
						if (user.IPs) {
							console.log(user.IPs.indexOf(IP));
							if (user.IPs.indexOf(IP) === -1) {
								user.IPs = user.IPs + "," + IP;
							}
						} else {
							user.IPs = IP;
						}
						console.log("made it here");
						user.save(function (err) {
							if (err) {
								console.log("error ${0}", err);
								res.json({
									success: false,
									error: "Problem issuing token"
								});
							} else {
								generateJWT(user, function (token, error) {
									if (error !== null) {
										res.json({
											success: false,
											error: "Problem issuing token",
											token: null
										});
									} else {
										console.log("we should be good");
										res.json({ success: true, error: null, token: token });
									}
								});
							}
						});
					}
				});
			}
		});
	});
	function generateJWT(user, callback) {
		_jsonwebtoken2.default.sign(user.toJSON(), 'superSecret', { expiresIn: '25d' }, function (err, token) {
			if (err) {
				callback(null, err);
			} else {
				callback(token, null);
			}
		});
	}

	router.post(registerRoute, function (req, res, next) {
		var password = req.body.password;
		var passwordConfirm = req.body.passwordConfirm;
		var email = req.body.email.trim().toLowerCase();
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var IP = req.headers['x-forwarded-for'];

		if (password !== passwordConfirm) {
			res.json({
				success: false,
				message: "Passwords don't match"
			});
		} else {
			_bcrypt2.default.hash(password, saltRounds, function (err, hash) {
				if (err) {
					return res.json({
						success: false,
						message: "Something went wrong",
						token: null
					});
				} else {
					User.findOne({
						email: email,
						password: hash,
						firstName: firstName,
						lastName: lastName
					}, function (user) {
						if (!user) {
							(function () {
								var newUser = new User({
									email: email,
									password: hash,
									firstName: firstName,
									lastName: lastName,
									IPs: IP
								});

								newUser.save(function (err) {
									var errorMessage = "";
									if (err) {
										errorMessage = "there was an error try again";
										if (err.code === 11000) {
											errorMessage = "This email already exists, try logging in";
											res.json({ error: errorMessage });
										}
									} else {
										generateJWT(newUser, function (token, error) {
											if (error !== null) {
												res.json({
													success: false,
													error: "Problem issuing token",
													token: null
												});
											} else {
												res.json({
													success: true,
													error: null,
													token: token
												});
											}
										});
									}
								});
							})();
						} else {
							res.json({
								success: false,
								error: "Problem issuing token",
								token: null
							});
						}
					});
				}
			});
		}
	});

	router.get(logoutRoute, function (req, res, next) {
		//   res.clearCookie("Token");
		//  res.redirect('/authentication/login');
	});

	router.post(recoverRoute, function (req, res, next) {

		var randomstring = Math.random().toString(36).slice(-8);
		var requestingEmail = req.body.email.trim().toLowerCase();
		var urlForRecovery = "http://fredp613.com/authentication/recoverconfirm?email=" + requestingEmail + "&safestring=" + randomstring;
		var encodedURI = encodeURIComponent(urlForRecovery);

		User.findOne({ email: requestingEmail }, function (err, user) {
			var errorMessage = "";
			if (err) {
				errorMessage = err.Message;
				res.json({ error: errorMessage });
			}
			if (!user) {
				errorMessage = "this email does not exist, please try again";
				res.json({ error: errorMessage });
			}
			if (user) {
				PasswordRecovery.remove({ email: requestingEmail }, function (err) {
					if (err) {
						res.json({ error: "Something went wrong" });
					}
					var newPasswordRecovery = new PasswordRecovery({
						email: requestingEmail,
						tempPassword: randomstring
					});
					newPasswordRecovery.save(function (err) {
						if (err) {
							res.json({ error: "something went wrong try again later" });
						} else {
							(0, _email.sendEmail)("fredp613@gmail.com", "Password recovery", "click on the following link to reset your password:" + urlForRecovery);
							res.json({ status: "success" });
						}
					});
				});
			};
		});
	});

	router.post(recoverConfirmRoute, function (req, res, next) {

		var paramPwd = req.body.password;
		var paramPwdConfirm = req.body.passwordConfirm;
		var paramEmail = req.body.email;

		if (paramPwd !== paramPwdConfirm) {
			return res.json({ title: "Confirm temporary password",
				error: "passwords don't match, try again" });
		}
		PasswordRecovery.findOne({ email: paramEmail }, function (err, pr) {
			if (err) {
				return res.json({ title: "Confirm temporary password",
					error: err.Message });
			}
			if (!pr) {
				return res.json({ title: "Confirm temporary password", error: "somethign went wrong - not found" });
			}
			if (pr) {
				_bcrypt2.default.hash(paramPwd, saltRounds, function (err, hash) {
					User.findOne({ email: paramEmail }, function (err, user) {
						if (err) {
							return res.json({ error: "something went wrong" });
						}
						if (!user) {
							return res.json({ error: "user not found" });
						}
						User.update(user, { password: hash }, null, function (err) {
							if (err) {
								return res.json({
									error: err.Message
								});
							}
							res.json({ success: true });
						});
					});
				});
			}
		});
	});
};

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _models = require('./models');

var _email = require('./email');

var _authenticate = require('./authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (router, mongoose, rootPath) {

	router.use((0, _authenticate2.default)(mongoose));

	var User = (0, _models.UserModel)(mongoose);
	var PasswordRecovery = (0, _models.PasswordRecoveryModel)(mongoose);
	var loginRoute = rootPath ? rootPath + "/login" : "/login";
	var logoutRoute = rootPath ? rootPath + "/logout" : "/logout";
	var registerRoute = rootPath ? rootPath + "register" : "register";
	var recoverRoute = rootPath ? rootPath + "recover" : "recover";
	var recoverConfirmRoute = rootPath ? rootPath + "recoverconfirm" : "recoverconfirm";

	var saltRounds = 10;

	router.get(loginRoute, function (req, res) {
		res.render('login', { title: "Login Page", csrfToken: req.csrfToken() });
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
				res.render('login', { error: errorMessage });
			}
			if (!user) {
				errorMessage = "Invalid email";
				res.render('login', { error: errorMessage });
			} else {
				_bcrypt2.default.compare(param_password, user.password, function (err, compared) {
					// res == false
					console.log(param_password, user.password, compared);
					if (compared === false || compared === undefined) {
						res.render('login', { success: false, error: "Password incorrect", csrfToken: req.csrfToken() });
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
								res.render('login', {
									success: false,
									error: "Problem issuing token",
									csrfToken: req.csrfToken()
								});
							} else {
								generateJWT(user, function (token, error) {
									if (error !== null) {
										res.render('login', {
											success: false,
											error: "Problem issuing token",
											token: null
										});
									} else {
										console.log("we should be good");
										res.cookie('Token', token, { maxAge: 3600000, httpOnly: true });
										res.redirect("/authentucation/home");
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
	router.get(registerRoute, function (req, res) {
		res.render('register', { title: "register page", csrfToken: req.csrfToken() });
	});

	router.post(registerRoute, function (req, res, next) {
		var password = req.body.password;
		var passwordConfirm = req.body.passwordConfirm;
		var email = req.body.email.trim().toLowerCase();
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var IP = req.headers['x-forwarded-for'];

		if (password !== passwordConfirm) {
			res.render('register', {
				success: false,
				message: "Passwords don't match"
			});
		} else {
			_bcrypt2.default.hash(password, saltRounds, function (err, hash) {
				if (err) {
					return res.render('register', {
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
											res.render('register', { error: errorMessage });
										}
									} else {
										generateJWT(newUser, function (token, error) {
											if (error !== null) {
												res.render('register', {
													success: false,
													error: "Problem issuing token",
													token: null
												});
											} else {
												console.log("we should be good");
												res.cookie('Token', token, { maxAge: 3600000, httpOnly: true });
												(0, _email.sendEmail)("fredp613@gmail.com", "Registered", "Thank you for registering");
												res.redirect('/authentication/home');
											}
										});
									}
								});
							})();
						} else {
							res.render('register', {
								success: false,
								message: "User already exists",
								token: null
							});
						}
					});
				}
			});
		}
	});

	router.get(logoutRoute, function (req, res, next) {
		res.clearCookie("Token");
		res.redirect('/authentication/login');
	});

	router.delete('/authentication/delete', function (req, res, next) {

		db.User.destroy({
			where: { email: req.body.user.email }
		}).then(function (success) {
			if (success) {
				res.json({
					success: true,
					message: "successfully deleted"
				});
			} else {
				res.json({
					success: false,
					message: "something went wrong"
				});
			}
		});
	});

	router.get(recoverRoute, function (req, res, next) {
		res.clearCookie("Token");
		res.render('recover', { Title: "Recover Password", csrfToken: req.csrfToken() });
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
				res.render('recover', { error: errorMessage, csrfToken: req.csrfToken() });
			}
			if (!user) {
				errorMessage = "this email does not exist, please try again";
				res.render('recover', { error: errorMessage, csrfToken: req.csrfToken() });
			}
			if (user) {
				PasswordRecovery.remove({ email: requestingEmail }, function (err) {
					if (err) {
						res.render('recover', { error: "Something went wrong", csrfToken: req.csrfToken() });
					}
					var newPasswordRecovery = new PasswordRecovery({
						email: requestingEmail,
						tempPassword: randomstring
					});
					newPasswordRecovery.save(function (err) {
						if (err) {
							res.render('recover', { error: "something went wrong try again later",
								csrfToken: req.csrfToken() });
						} else {
							(0, _email.sendEmail)("fredp613@gmail.com", "Password recovery", "click on the following link to reset your password:" + urlForRecovery);
							res.render('recover', { status: "success", csrfToken: req.csrfToken() });
						}
					});
				});
			};
		});
	});

	router.get(recoverConfirmRoute, function (req, res, next) {
		console.log(req.query.email + "-" + req.query.safestring);
		res.render('recoverconfirm', { title: "Confirm temporary password",
			email: req.query.email, csrfToken: req.csrfToken() });
	});

	router.post(recoverConfirmRoute, function (req, res, next) {

		var paramPwd = req.body.password;
		var paramPwdConfirm = req.body.passwordConfirm;
		var paramEmail = req.body.email;

		if (paramPwd !== paramPwdConfirm) {
			return res.render('recoverconfirm', { title: "Confirm temporary password",
				error: "passwords don't match, try again", csrfToken: req.csrfToken() });
		}
		PasswordRecovery.findOne({ email: paramEmail }, function (err, pr) {
			if (err) {
				return res.render('recoverconfirm', { title: "Confirm temporary password",
					error: err.Message, csrfToken: req.csrfToken() });
			}
			if (!pr) {
				return res.render('recoverconfirm', { title: "Confirm temporary password", error: "somethign went wrong - not found", csrfToken: req.csrfToken() });
			}
			if (pr) {
				_bcrypt2.default.hash(paramPwd, saltRounds, function (err, hash) {
					User.findOne({ email: paramEmail }, function (err, user) {
						if (err) {
							return res.render('recoverconfrim', { error: "something went wrong", csrfToken: req.csrfToken() });
						}
						if (!user) {
							return res.render('recoverconfirm', { error: "user not found", csrfToken: req.csrfToken() });
						}
						User.update(user, { password: hash }, null, function (err) {
							if (err) {
								return res.render('recoverconfirm', {
									error: err.Message,
									csrfToken: req.csrfToken()
								});
							}
							res.redirect('/authentication/home');
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
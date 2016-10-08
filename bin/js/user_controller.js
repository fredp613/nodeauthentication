'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (router, mongoose) {

	var User = (0, _models.UserModel)(mongoose);
	var PasswordRecovery = (0, _models.PasswordRecoveryModel)(mongoose);
	//	let User = schema(mongoose, "User");
	var saltRounds = 10;

	router.get('/profile', function (req, res, next) {
		User.findOne({
			where: { email: req.body.user.email },
			attributes: ['email']
		}).then(function (user) {
			if (!user) {
				res.render('home', json({
					success: false,
					message: "Problem finding user",
					user: null
				}));
			} else {
				res.render('profile', json({
					success: true,
					message: "User found",
					user: user
				}));
			}
		});
	});

	router.put('/profile', function (req, res, next) {
		User.findOne({
			where: { email: req.body.user.email },
			attributes: ['email', 'firstName', 'lastName']
		}).then(function (user) {

			if (!user) {
				res.render('home', json({
					success: false,
					message: "Problem finding user",
					user: null
				}));
			} else {
				//UPDATE USER        
				User.update({
					firstName: req.body.user.firstName,
					lastName: req.body.user.lastName
				}, {
					where: {
						email: req.body.user.email
					}
				}).then(function (user) {
					res.render('profile', json({
						success: true,
						message: "User UPDATED",
						user: user
					}));
				});
			}
		});
	});

	router.get('/authentication/login', function (req, res) {
		res.render('login', { title: "Login Page", csrfToken: req.csrfToken() });
	});

	router.post('/authentication/login', function (req, res) {

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
										res.redirect("/authentication/home");
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
	router.get('/authentication/register', function (req, res) {
		res.render('register', { title: "register page", csrfToken: req.csrfToken() });
	});

	router.post('/authentication/register', function (req, res, next) {
		var password = req.body.password;
		var passwordConfirm = req.body.passwordConfirm;
		var email = req.body.email;
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
												//res.render('home',{
												//	success: true,
												//	message: "Enjoy your token",
												//	token: token
												//});
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

	router.get('/authentication/logout', function (req, res, next) {
		res.clearCookie("Token");
		//	   req.session.destroy((err)=>{
		res.redirect('/authentication/login');
		//	   });
	});

	router.delete('/authentication/delete', function (req, res, next) {
		//clear cookies and or local storage  
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

	router.get('/authentication/recover', function (req, res, next) {
		res.render('recover', { Title: "Recover Password", csrfToken: req.csrfToken() });
	});

	router.post('/authentication/recover', function (req, res, next) {
		//send email and if email success alert user then show a form
		var randomstring = Math.random().toString(36).slice(-8);

		var requestingEmail = req.body.email.trim().toLowerCase();

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
						res.render('recover', { error: "Something went wrong",
							csrfToken: req.csrfToken() });
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
							(0, _email.sendEmail)("fredp613@gmail.com", "Password recovery", "temporary password is:" + randomstring);
							res.redirect('/authentication/recoverconfirm');
						}
					});
				});
			}
		});
	});

	router.get('/authentication/recoverconfirm', function (req, res, next) {
		res.render('recoverconfirm', { Title: "Confirm temporary password" });
	});

	router.put('/authentication/recoverconfirm', function (req, res, next) {

		var paramTemp = req.body.user.tempPassword;
		var paramPwd = req.body.user.password;
		var paramPwdConfirm = req.body.user.passwordConfirmation;
		var email = req.body.user.email;

		db.PasswordRecovery.findOne({
			where: { email: email }
		}).then(function (pr) {
			if (!pr) {
				res.json({
					success: false,
					message: "Something went wrong try again later"
				});
			} else {
				var temp = pr.tempPassword;
				if (paramTemp === temp) {
					if (paramPwd === paramPwdConfirm) {

						//UPDATE USER 
						_bcrypt2.default.hash(paramPwd, saltRounds, function (err, hash) {

							if (err) {
								res.json({
									success: false,
									message: "Something went wrong try again later"
								});
							} else {
								db.User.update({
									password: hash
								}, {
									where: {
										email: req.body.user.email
									}
								}).then(function (user) {
									db.PasswordRecovery.destroy({ where: { email: email } });
									res.json({
										success: true,
										message: "recovered successfully",
										user: user
									});
								});
							}
						});
					} else {
						res.json({
							success: false,
							message: "new passwords don't match"
						});
					}
				} else {
					res.json({
						success: false,
						message: "temp password incorrect"
					});
				}
			}
		});
	});
};

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _testclass = require('./testclass');

var _testclass2 = _interopRequireDefault(_testclass);

var _models = require('./models');

var _email = require('./email');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

//import { schema } from './models';
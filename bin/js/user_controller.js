'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (router, mongoose1) {

	var Schema = _mongoose2.default.Schema;
	var User = _mongoose2.default.model('User', new Schema({
		firstName: String,
		lastName: String,
		email: { type: String, unique: true },
		password: String
	}));

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
		res.render('login', { title: "Login Page" });
	});

	router.post('/authentication/login', function (req, res) {

		var param_email = req.body.email;
		var param_password = req.body.password;
		var errorMessage = "";

		User.findOne({ email: param_email }, function (err, user) {
			var errorMessage = "";
			var IP = req.headers['x-forwarded-for'];
			console.log(IP);
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
						res.render('login', { success: false, error: "Password incorrect" });
					} else {
						_jsonwebtoken2.default.sign(user.toJSON(), 'superSecret', { expiresIn: '25d' }, function (err, token) {
							if (err) {
								res.render('login', {
									success: false,
									error: "Problem issuing token",
									token: null
								});
							} else {
								res.cookie('Token', token, { maxAge: 3600000, httpOnly: true });
								res.redirect("/authentication/home");
							}
						});
					}
				});
			}
		});
	});

	router.get('/authentication/register', function (req, res) {
		res.render('register', { title: "register page" });
	});

	router.post('/authentication/register', function (req, res, next) {
		var password = req.body.password;
		var passwordConfirm = req.body.passwordConfirm;
		var email = req.body.email;
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;

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
							var newUser = new User({
								email: email,
								password: hash,
								firstName: firstName,
								lastName: lastName
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
									_jsonwebtoken2.default.sign(newUser.toJSON(), 'superSecret', { expiresIn: '25d' }, function (err, token) {

										res.cookie('Token', token, { maxAge: 3600000, httpOnly: true });
										res.render('home', {
											success: true,
											message: "Enjoy your token",
											token: token
										});
									});
								}
							});
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

	router.post('/authentication/recoverPassword', function (req, res, next) {
		//send email and if email success alert user then show a form
		var randomstring = Math.random().toString(36).slice(-8);

		var requestingEmail = req.body.user.email;

		console.log(process.env.EMAIL, process.env.EMAIL_PWD);

		db.PasswordRecovery.destroy({ where: { email: requestingEmail } }).then(function () {
			db.PasswordRecovery.create({
				email: requestingEmail,
				tempPassword: randomstring
			}).then(function (pr) {
				if (pr) {
					var transporter = _nodemailer2.default.createTransport({
						service: 'Gmail',
						auth: {
							user: process.env.EMAIL,
							pass: process.env.EMAIL_PWD
						}
					});

					var mailOptions = {
						from: process.env.EMAIL, // sender address
						to: requestingEmail, // list of receivers
						subject: 'SUMATRA: Password Recovery', // Subject line
						text: "This is your temporary password: " + randomstring //, // plaintext body
						// html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
					};

					transporter.sendMail(mailOptions, function (error, info) {
						if (error) {
							res.json({
								success: false,
								reponse: error
							});
						} else {
							res.json({
								success: true,
								reponse: info.response
							});
						};
					});
				} else {
					res.json({
						success: false,
						reponse: "something went wrong"
					});
				}
			});
		});
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

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
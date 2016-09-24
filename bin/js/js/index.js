'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _countries = require('./countries');

var _countries2 = _interopRequireDefault(_countries);

var _server = require('./server.listen');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)(),
    PORT = "3005";

app.get('/authentication/home', function (req, res) {
	res.render('index.html');
});

app.get('/authentication/login', function (req, res) {
	res.render('login.html');
});

app.post('/authentication/login', function (req, res) {
	//res.render('login.html');
});

app.get('/authentication/register', function (req, res) {
	res.render('register.html');
});

app.post('/authentication/register', function (req, res) {
	//res.render('profile.html');
});

app.get('/authentication/profile', function (req, res) {
	res.render('profile.html');
});

app.post('/authentication/logout', function (req, res) {
	//res.render('profile.html');
});

app.get('/authentication/forgotpassword', function (req, res) {
	res.render('forgotpassword.html');
});

app.post('/authentication/passwordrecovery', function (req, res) {
	//res.render('profile.html');
});

app.post('/authentication/passwordrecovered', function (req, res) {
	//res.render('profile.html');
});

(0, _countries2.default)(app);
(0, _server2.default)(app, PORT);
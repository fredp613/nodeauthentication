'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = home_controller;
function home_controller(router, mongoose) {

	router.get('/about', function (req, res) {
		res.render('about', { title: "about page" });
	});

	router.get('/', function (req, res) {
		res.render('public', { title: "public react app page" });
	});

	router.get('/home', function (req, res) {
		res.render('home', { title: "Authenticated Home Page" });
	});
}
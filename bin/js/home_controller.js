'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = home_controller;
function home_controller(router, mongoose) {

	router.get('/authentication/home', function (req, res) {
		res.render('home', { title: "Authenticated Home Page" });
	});
}
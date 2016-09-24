"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (app) {
	app.get('/authentication', function (req, res) {
		res.status(200).json(["Netherlands", "Canada", "US", "Mexico", "test", "fred", "john"]);
	});
};
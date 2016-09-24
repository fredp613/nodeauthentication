'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (app, PORT) {
	app.listen(PORT, function () {
		console.log('listening on Port -- you know it', PORT);
	});
};
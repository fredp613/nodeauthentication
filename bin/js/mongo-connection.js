'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {

	_mongoose2.default.connect('mongodb://localhost/auth');
	return _mongoose2.default;
};

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
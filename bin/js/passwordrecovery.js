"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//let mongoose = require('mongoose');

var Schema = _mongoose2.default.Schema;

var PasswordRecovery = function (_mongoose$Schema) {
	_inherits(PasswordRecovery, _mongoose$Schema);

	function PasswordRecovery() {
		_classCallCheck(this, PasswordRecovery);

		return _possibleConstructorReturn(this, (PasswordRecovery.__proto__ || Object.getPrototypeOf(PasswordRecovery)).call(this, {
			email: String,
			tempPassword: String
		}));
	}

	return PasswordRecovery;
}(_mongoose2.default.Schema);

exports.default = _mongoose2.default.model('PasswordRecovery', new PasswordRecovery());

/**
export function User() {

	let user = mongoose.model('User', new Schema({
		firstName: String,
		lastName: String,
		email: {type: String, unique: true},
		password: String,
		IPs: String,
	}));
	return user;
}

export function PasswordRecovery() {

	let pwr = mongoose.model('PasswordRecovery', new Schema({
		email: String,
		tempPassword: String,
	}));
	return pwr;

}
**/

/**
class Model {
	constructor(mongoose, collectionName) {
		this.mongoose = mongoose;
		this.collectionName = collectionName
	}

    getModelSchema() {
		let Schema = this.mongoose.Schema;
		if (this.collectionName == 'User') {
			let user = this.mongoose.model(this.collectionName, new Schema({
				firstName: String,
				lastName: String,
				email: {type: String, unique: true},
				password: String
			}));
			return user;
		} 
		//return undefined;
	}

}

let schema = (mongoose, collectionName) => {
	let model = new Model(mongoose, collectionName);
	return model.getModelSchema();
}
export { schema };
**/
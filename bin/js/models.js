'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.User = User;
exports.PasswordRecovery = PasswordRecovery;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//let mongoose = require('mongoose');

var Schema = _mongoose2.default.Schema;

function User() {

	var user = _mongoose2.default.model('User', new Schema({
		firstName: String,
		lastName: String,
		email: { type: String, unique: true },
		password: String,
		IPs: String
	}));
	return user;
}

function PasswordRecovery() {

	var pwr = _mongoose2.default.model('PasswordRecovery', new Schema({
		email: String,
		tempPassword: String
	}));
	return pwr;
}

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
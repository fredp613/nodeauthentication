'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.UserModel = UserModel;
exports.PasswordRecoveryModel = PasswordRecoveryModel;
function UserModel(mongoose) {
	var Schema = mongoose.Schema;
	var user = mongoose.model('User', new Schema({
		firstName: String,
		lastName: String,
		email: { type: String, unique: true },
		password: String,
		IPs: String
	}));
	return user;
}

function PasswordRecoveryModel(mongoose) {
	var Schema = mongoose.Schema;
	var pwr = mongoose.model('PasswordRecovery', new Schema({
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
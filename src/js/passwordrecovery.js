import mongoose from "mongoose"
//let mongoose = require('mongoose');

let Schema = mongoose.Schema;

class PasswordRecovery extends mongoose.Schema {
	constructor() { 
		super({
			email: String,
			tempPassword: String
		})
	}

}
export default mongoose.model('PasswordRecovery', new PasswordRecovery);

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

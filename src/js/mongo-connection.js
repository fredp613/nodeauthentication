import mongoose from 'mongoose'

export default function() {

	mongoose.connect('mongodb://localhost/auth');
	return mongoose;

}



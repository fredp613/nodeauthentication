import express from 'express';
import countries from './countries';
import listen from './server.listen';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import user_controller from './user_controller';
import home_controller from './home_controller';
import authenticated from './authenticate';
			
let app = express(),
	PORT = "3006";

//view engine setup
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'hbs');

let sess = {
	secret: "fred",
	name: "Fred-Session",
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: 60000},
}

mongoose.connect('mongodb://localhost/auth');

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) //trust first proxy
	sess.cookie.secure = true //serve secure cookies (https)
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(session(sess));
app.use(authenticated(mongoose));

countries(app);
user_controller(app, mongoose);
home_controller(app, mongoose);

listen(app, PORT);

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
import dotenv from 'dotenv';
import 'babel-polyfill';
import csrf from 'csurf';

dotenv.config();
//
let app = express(),
	PORT = "3006";
//set up for CSRF proection
let csrfProtection = csrf({cookie:true});
let parseForm = bodyParser.urlencoded({extended: false});

//view engine setup
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'hbs');

mongoose.connect('mongodb://localhost/auth');

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) //trust first proxy
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(csrfProtection);
app.use(authenticated(mongoose));

user_controller(app, mongoose);
user_api_controller(app, mongoose, "/authentication");


home_controller(app, mongoose);

listen(app, PORT);

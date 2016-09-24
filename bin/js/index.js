'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _countries = require('./countries');

var _countries2 = _interopRequireDefault(_countries);

var _server = require('./server.listen');

var _server2 = _interopRequireDefault(_server);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user_controller = require('./user_controller');

var _user_controller2 = _interopRequireDefault(_user_controller);

var _home_controller = require('./home_controller');

var _home_controller2 = _interopRequireDefault(_home_controller);

var _authenticate = require('./authenticate');

var _authenticate2 = _interopRequireDefault(_authenticate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)(),
    PORT = "3006";

//view engine setup
app.set('views', _path2.default.join(__dirname, '../../views'));
app.set('view engine', 'hbs');

var sess = {
	secret: "fred",
	name: "Fred-Session",
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
};

_mongoose2.default.connect('mongodb://localhost/auth');

if (app.get('env') === 'production') {
	app.set('trust proxy', 1); //trust first proxy
	sess.cookie.secure = true; //serve secure cookies (https)
}

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use((0, _cookieParser2.default)());
app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));
//app.use(session(sess));
app.use((0, _authenticate2.default)(_mongoose2.default));

(0, _countries2.default)(app);
(0, _user_controller2.default)(app, _mongoose2.default);
(0, _home_controller2.default)(app, _mongoose2.default);

(0, _server2.default)(app, PORT);
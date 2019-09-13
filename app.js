var express         = require('express');
var session         = require('express-session');
var mysql           = require("mysql");
var dbconfig        = require('./config/database');
var connection      = mysql.createConnection(dbconfig.connection);
var MySQLStore      = require('express-mysql-session')(session);
var sessionStore    = new MySQLStore({}, connection);
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var flash           = require('connect-flash');

// define routes
var index = require('./routes/index');
var users = require('./routes/users');
var changepassword = require('./routes/change-password');
var createTest = require('./routes/create-test');
var editTest = require('./routes/edit-test');
var takeTest = require('./routes/take-test');
var statistics = require('./routes/statistics');

var logout = require('./routes/logout');

var app = express();
require('./config/passport')(passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({
  key: 'QuizAppSession',
	secret: 'ThisQuizAppIsNotTheBestButAlsoNotTheWorst',
  store: sessionStore,
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/login.js')(app, passport);

// usage of the defined routes
app.use('/', index);
app.use('/users', users);
app.use('/change-password', changepassword);
app.use('/create-test', createTest);
app.use('/edit-test', editTest);
app.use('/take-test', takeTest);
app.use('/statistics', statistics);

app.use('/logout', logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

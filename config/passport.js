var mysql = require("mysql");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
  	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT users.*, roles.name FROM users INNER JOIN roles ON users.role_id = roles.id where users.id = ? ", [id], function(err, rows) {
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

         connection.query("SELECT users.* FROM users WHERE username = ? AND password = aes_encrypt(?, ?)" ,[username, password, username],function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'Incorrect login details.')); // req.flash is the way to set flashdata using connect-flash
            } 

			// if the user is found and the password is correct, but the user has been disabled
            if (!( rows[0].active == 1))
                return done(null, false, req.flash('loginMessage', 'Your account has been disabled. Please contact a system administrator.')); // create the loginMessage and save it to session as flashdata
			
            // all is well, return successful user
            return done(null, rows[0]);			
		
		});

    }));
}
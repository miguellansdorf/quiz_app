var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {
    
	// =====================================
	// LOGIN ===============================
	// =====================================
	app.get('/login', isLoggedIn, function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.pug', { title: 'Login', errorMessage: req.flash('loginMessage'), successMessage: req.flash('logoutMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {

	// if user is not authenticated in the session, carry on
	if (!req.isAuthenticated())
		return next();

	// if they are redirect them to the home page
	res.redirect('/');
}
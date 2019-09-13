var express = require('express');
var router = express.Router();

router.get('/', isLoggedIn, function(req, res, next) {
	req.flash('logoutMessage', 'You have successfully been logged out');
	res.render('login', { title: 'Login', errorMessage: req.flash('loginMessage'), successMessage: req.flash('logoutMessage') });
	req.session.destroy();
});

module.exports = router;

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
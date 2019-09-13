var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// =====================================
// Change Password =====================
// =====================================
router.get('/', isLoggedIn, function(req, res, next) {
	// render the page and pass in any flash data if it exists
	res.render('change-password', { title: 'Change Password', user : req.user});
});

// process the change password form
router.post('/', isLoggedIn, function(req, res) {
	var currentPassword = req.body.currentPassword;
	var newPassword = req.body.newPassword;
	var repeatNewPassword = req.body.repeatNewPassword;
	var errorMessage = '';
	var successMessage = '';

	connection.query("SELECT users.*, password(?) as encrypted_password_current, password(?) as encrypted_password_new, password(?) as encrypted_password_new_repeat FROM users WHERE id = ?" ,[currentPassword, newPassword, repeatNewPassword, req.user.id],function(err,rows){
		if (err){
			errorMessage = "Error retrieving user information. " + err;;
			res.json({ errorMessage : errorMessage });
		}
		else if (!rows.length) {
			errorMessage = "No user found.";
			res.json({ errorMessage : errorMessage });
		} 
		else {
			// if the user is found but the password is wrong
			if (!( rows[0].password == rows[0].encrypted_password_current)) {
				errorMessage = "Incorrect Password!!";
				res.json({ errorMessage : errorMessage });
			}
			// if the user is found and the password is correct, but the new passwords do not match
			else if (!( rows[0].encrypted_password_new == rows[0].encrypted_password_new_repeat)){
				errorMessage = "The new password and repeated password do not match";
				res.json({ errorMessage : errorMessage });
			}
			else {
				// all is well, return successful user	
				connection.query("UPDATE users SET password = ? WHERE id = ?" ,[rows[0].encrypted_password_new, req.user.id],function(updatedUserErr,updatedUser){
					if (updatedUserErr) {
						errorMessage = "Error updating you password!! " + updatedUserErr;
						res.json({ errorMessage : errorMessage });
					}
					else{
						successMessage = "Password changed successfully";
						res.json({ successMessage : successMessage });
					}	
					
				});
			}
		}
	});
});

module.exports = router;


function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}

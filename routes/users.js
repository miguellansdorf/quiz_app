var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// =====================================
// User Management =====================
// =====================================
router.get('/', isLoggedIn, function(req, res, next) {
	res.render('users.pug', { title: 'User Management', user : req.user} ); // load the users.pug file
});

router.get('/data', isLoggedIn, function(req, res, next) {
	var errorMessage = '';
	
    connection.query('SELECT users.id as user_id, username, firstname, lastname, email, active, roles.id as role_id, roles.name FROM users INNER JOIN roles ON users.role_id = roles.id ORDER BY username',function(err1,users){
		if(err1) errorMessage = "Error retrieving data. " + err1;
		connection.query('SELECT * FROM roles',function(err2,roles){
			if(err2) errorMessage = "Error retrieving data. " + err2;
			res.json({ users: users, roles: roles, errorMessage: errorMessage });
		});
	});
});

router.post('/createUser', isLoggedIn, function(req, res) {
	var username = req.body.username;
  	var firstname = req.body.firstname;
  	var lastname = req.body.lastname
	var email = req.body.email;
	var userrole = req.body.role_id;
	var password = req.body.password;
	var passwordRepeat = req.body.password_repeat;
	var errorMessage = '';
	var successMessage = '';
	
	if(password != passwordRepeat) {
		errorMessage = "The passwords do not match";
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	}
	else {
		connection.query('SELECT * from users where username = ?', [username], function(err,rows1){
			if(err) {
				errorMessage = "Error executing query!! " + err;
				res.json({errorMessage: errorMessage, successMessage: successMessage})
			}
			
			if(rows1.length != 0){
				errorMessage = "user with username " + username + " already exists";
				res.json({errorMessage: errorMessage, successMessage: successMessage})
			}
			else {
				connection.query('INSERT INTO users (role_id, username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?, aes_encrypt(?, ?))', [userrole, username, firstname, lastname, email, password, username], function(err,rows2){
					if(err) {
						errorMessage = "Error Creating user " + username + ". Please try again";
						res.json({errorMessage: errorMessage, successMessage: successMessage})
					}
					else {
						successMessage = "User " + username + " created successfully with ID: " + rows2.insertId;
						res.json({errorMessage: errorMessage, successMessage: successMessage})
					}
				});
			}
		});
	}
});

router.post('/updateUser', isLoggedIn, function(req, res) {
	var username = req.body.username;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname
	var email = req.body.email;
	var userrole = req.body.role_id;
	var userstatus = req.body.active;
	var userid = req.body.user_id;
	var errorMessage = '';
	var successMessage = '';

	if(userid != req.user.id){
		connection.query('UPDATE users SET role_id = ?, username = ?, firstname = ?, lastname = ?, email = ?, active = ? WHERE id = ?', [userrole, username, firstname, lastname, email, userstatus, userid], function(err,rows){
			if(err) {
				errorMessage = "Error updating user " + username + " with ID: " + userid + ". Please try again";
			}
			else {
				successMessage = "User " + username + " with ID: " + userid + " edited successfully";
			}
			
			res.json({errorMessage: errorMessage, successMessage: successMessage})
		});
	}
	else {
		connection.query('UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ? WHERE id = ?', [username, firstname, lastname, email, userid], function(err,rows){
			if(err) {
				errorMessage = "Error updating user " + username + " with ID: " + userid + ". Please try again";
			}
			else {
				successMessage = "User " + username + " with ID: " + userid + " edited successfully";
			}
			
			res.json({errorMessage: errorMessage, successMessage: successMessage})
		});
	}
});

router.post('/deleteUser', isLoggedIn, function(req, res) {
	var username = req.body.user_name;
	var userid = req.body.user_id;
	var errorMessage = '';
	var successMessage = '';

	if(userid != req.user.user_id){
		connection.query('DELETE FROM users WHERE id = ?', [userid], function(err,rows){
			if(err) {
				errorMessage = "Error deleting user " + username + " with ID: " + userid + ". " + err;
			}
			else {
				successMessage = "User " + username + " with ID: " + userid + " deleted successfully";
			}
			
			res.json({errorMessage: errorMessage, successMessage: successMessage})
		});
	}
	else {
		errorMessage = "Error deleting user " + username + " with ID: " + userid + ". You are currently logged on as this user";
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	}
});

module.exports = router;

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated() && req.user.role_id != 1)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
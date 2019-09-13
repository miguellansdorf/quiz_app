//Database Login Details. Everything except for the database name is flexible to your choosing. The database name is hardcoded in the 
//database model and the necessary_inserts.sql script file. Change the name is all those places and in this file if you want to provide
//a different database name.

module.exports = {
    'connection': {
        'host': 'localhost',
        'user': 'quiz_app',
        'password': 'quiz_app',
        'database': 'quiz_app',
    },
	'database': 'quiz_app',
    'users_table': 'users'
};
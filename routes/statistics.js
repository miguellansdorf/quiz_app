var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

// =====================================
// Statistics ==========================
// =====================================
router.get('/', isLoggedIn, function(req, res, next) {
	res.render('statistics.pug', { title: 'Statistics', user : req.user} );
});

router.get('/getProjects', isLoggedIn, function(req, res, next) {
    var errorMessage = '';

    connection.query('SELECT * FROM projects', function(projectsErr, projects) {
        if (projectsErr) {
            errorMessage = "Error retrieving projects " + projectsErr;
        }

        res.json({ errorMessage: errorMessage, projects: projects })
    });
});

router.post('/getUsers', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';

	connection.query('SELECT \'\' as firstname, \'\' as lastname, \'\' as username FROM users UNION SELECT users.firstname, users.lastname, users.username FROM users INNER JOIN test_sessions ON users.id = test_sessions.user_id INNER JOIN test_answers ON test_sessions.id = test_answers.session_id INNER JOIN questions ON test_answers.question_id = questions.id WHERE project_id = ?', [projectID], function(usersErr,users){
		if(usersErr) {
			errorMessage = "Error retrieving users! " + usersErr;
		}
				
		res.json({errorMessage: errorMessage, users : users})
	});
});

router.post('/getTests', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';

	connection.query('SELECT \'\' as test FROM test_results UNION SELECT DISTINCT test_results.test FROM test_results WHERE project_id = ?', [projectID], function(testsErr,tests){
		if(testsErr) {
			errorMessage = "Error retrieving tests! " + testsErr;
		}
				
		res.json({errorMessage: errorMessage, tests : tests})
	});
});

router.post('/getLeaderboard', isLoggedIn, function(req, res, next) {
	var project = req.body.project;
	var errorMessage = '';

	connection.query('SELECT * FROM leaderboard WHERE project = ? LIMIT 5', [project], function(leaderboardErr,leaderboard){
		if(leaderboardErr) {
			errorMessage = "Error retrieving leaderboard! " + leaderboardErr;
		}

		res.json({errorMessage: errorMessage, leaderboard : leaderboard})
	});
});

router.post('/getLeaderboardToday', isLoggedIn, function(req, res, next) {
	var project = req.body.project;
	var today = req.body.today;
	var errorMessage = '';

	connection.query('SELECT * FROM leaderboard_by_day WHERE project = ? AND date = ? LIMIT 5', [project, today], function(leaderboardTodayErr,leaderboardToday){
		if(leaderboardTodayErr) {
			errorMessage = "Error retrieving leaderboard! " + leaderboardTodayErr;
		}
				
		res.json({errorMessage: errorMessage, leaderboardToday : leaderboardToday})
	});
});

router.post('/getQuestionsAnsweredIncorrectly', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';

	connection.query('SELECT * FROM question_errors WHERE project_id = ? LIMIT 5', [projectID], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions! " + questionsErr;
		}
				
		res.json({errorMessage: errorMessage, questions : questions})
	});
});

router.post('/getQuestionsAnsweredIncorrectlyDetailed', isLoggedIn, function(req, res, next) {
	var questionID = req.body.questionID;
	var errorMessage = '';

	connection.query('SELECT * FROM question_errors_detailed WHERE id = ?', [questionID], function(questionsDetailedErr,questionsDetailed){
		if(questionsDetailedErr) {
			errorMessage = "Error retrieving question details! " + questionsDetailedErr;
		}
				
		res.json({errorMessage: errorMessage, questionsDetailed : questionsDetailed})
	});
});

router.post('/getPersonalInfo', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var username = req.body.username;
	var errorMessage = '';

	connection.query(`SELECT users.firstname, users.lastname, users.username, questions.id, questions.question, COUNT(answers.answer) AS count_answers FROM users INNER JOIN test_sessions ON users.id = test_sessions.user_id INNER JOIN test_answers ON test_sessions.id = test_answers.session_id INNER JOIN answers ON test_answers.answer_id = answers.id AND answers.correct = 0 INNER JOIN questions ON test_answers.question_id = questions.id WHERE users.username = ? AND project_id = ? GROUP BY questions.id ORDER BY count_answers DESC LIMIT 10`, [username, projectID], function(personalInfoErr,personalInfo){
		if(personalInfoErr) {
			errorMessage = "Error retrieving Personal Info of " + username + "! " + personalInfoErr;
		}
				
		res.json({errorMessage: errorMessage, personalInfo : personalInfo})
	});
});

router.post('/getPersonalQuestionInfo', isLoggedIn, function(req, res, next) {
	var username = req.body.username;
	var questionID = req.body.questionID;
	var errorMessage = '';

	connection.query(`SELECT answers.answer, COUNT(answers.answer) AS count_answers FROM users INNER JOIN test_sessions ON users.id = test_sessions.user_id INNER JOIN test_answers ON test_sessions.id = test_answers.session_id INNER JOIN answers ON test_answers.answer_id = answers.id AND answers.correct = 0 INNER JOIN questions ON test_answers.question_id = questions.id WHERE users.username = ? AND questions.id = ? GROUP BY answers.id ORDER BY count_answers DESC`, [username, questionID], function(personalQuestionInfoErr,personalQuestionInfo){
		if(personalQuestionInfoErr) {
			errorMessage = "Error retrieving Personal Question Info! " + personalQuestionInfoErr;
		}
				
		res.json({errorMessage: errorMessage, personalQuestionInfo : personalQuestionInfo})
	});
});

router.post('/getPersonalBest', isLoggedIn, function(req, res, next) {
	var project = req.body.project;
	var username = req.body.username;
	var errorMessage = '';

	connection.query(`SELECT test_results.*, ROUND((test_results.correct_answers_percentage/10 * test_results.average_question_per_second), 2) as score FROM test_results WHERE username = ? AND project = ? ORDER BY score DESC LIMIT 1`, [username, project], function(personalBestErr,personalBest){
		if(personalBestErr) {
			errorMessage = "Error retrieving Personal Best of " + username + "! " + personalBestErr;
		}
				
		res.json({errorMessage: errorMessage, personalBest : personalBest})
	});
});

router.post('/getResults', isLoggedIn, function(req, res, next) {
	var project = req.body.project;
	var errorMessage = '';

	connection.query('SELECT * FROM test_results WHERE project = ? ORDER BY finish DESC', [project], function(testResultsErr,testResults){
		if(testResultsErr) {
			errorMessage = "Error retrieving test results! " + testResultsErr;
		}
				
		res.json({errorMessage: errorMessage, testResults : testResults})
	});
});

router.post('/getResultAnswers', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var errorMessage = '';

	connection.query('SELECT test_answers.*, questions.question, questions.image, answers.answer, answers.correct, all_answers.answer as `correct_answer` FROM test_answers INNER JOIN questions ON test_answers.question_id = questions.id INNER JOIN answers ON test_answers.answer_id = answers.id LEFT JOIN answers all_answers ON questions.id = all_answers.question_id AND all_answers.correct = 1 WHERE session_id = ? ORDER BY test_answers.id', [sessionID], function(resultAnswersErr,resultAnswers){
		if(resultAnswersErr) {
			errorMessage = "Error retrieving test results! " + resultAnswersErr;
		}
				
		res.json({errorMessage: errorMessage, resultAnswers : resultAnswers})
	});
});

module.exports = router;

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
    if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
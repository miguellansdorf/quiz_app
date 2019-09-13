var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

router.get('/', isLoggedIn, function(req, res, next) {
  res.render('take-test', { title: 'Take Test', user : req.user });
});

router.get('/getProjects', isLoggedIn, function(req, res, next) {
	var errorMessage = '';

	connection.query('SELECT * FROM projects', function(projectsErr,projects){
		if(projectsErr) {
			errorMessage = "Error retrieving projects " + projectsErr;
		}
		
		res.json({errorMessage: errorMessage, projects: projects})
	});
});

router.post('/getSimpleTests', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';
	
	connection.query('SELECT tests.*, users.firstname, users.lastname, categories.category, projects.project FROM tests INNER JOIN users ON tests.created_by = users.id INNER JOIN test_questions ON tests.id = test_questions.test_id INNER JOIN questions ON test_questions.question_id = questions.id INNER JOIN categories ON questions.category_id = categories.id INNER JOIN projects on questions.project_id = projects.id WHERE tests.active = 1 AND categories.id = 1 AND questions.active = 1 AND projects.id = ? GROUP BY tests.id', [projectID], function(simpleTestsErr,simpleTests){
		if(simpleTestsErr){
			errorMessage = "Error retrieving simple tests. " + simpleTestsErr;
		} 
		res.json({ errorMessage: errorMessage, simpleTests: simpleTests, angularUser: req.user});
	});
});

router.post('/getComplexTests', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';
	
    connection.query('SELECT tests.*, users.firstname, users.lastname, categories.category, projects.project FROM tests INNER JOIN users ON tests.created_by = users.id INNER JOIN test_questions ON tests.id = test_questions.test_id INNER JOIN questions ON test_questions.question_id = questions.id INNER JOIN categories ON questions.category_id = categories.id INNER JOIN projects on questions.project_id = projects.id WHERE tests.active = 1 AND categories.id = 2 AND questions.active = 1 AND projects.id = ? GROUP BY tests.id', [projectID], function(complexTestsErr,complexTests){
		if(complexTestsErr){
			errorMessage = "Error retrieving complex tests. " + complexTestsErr;
		} 
		res.json({ errorMessage: errorMessage, complexTests: complexTests, angularUser: req.user });
	});
});

router.post('/getTestQuestionsCount', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';
	
    connection.query('SELECT COUNT(*) AS count FROM questions WHERE project_id = ? AND category_id = 1 AND active = 1 UNION ALL SELECT COUNT(*) FROM questions WHERE project_id = ? AND category_id = 2 AND active = 1', [projectID, projectID], function(questionsCountErr,questionsCount){
		if(questionsCountErr){
			errorMessage = "Error retrieving complex tests. " + questionsCountErr;
		} 
		res.json({ errorMessage: errorMessage, simpleCount: questionsCount[0], complexCount: questionsCount[1] });
	});
});

router.post('/getQuestions', isLoggedIn, function(req, res, next) {
	var testid = req.body.id;
	var errorMessage = '';

	connection.query('SELECT questions.* FROM questions INNER JOIN test_questions ON questions.id = test_questions.question_id WHERE test_questions.test_id = ? AND questions.active = 1 ORDER BY RAND()', [testid], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions!" + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/getRandomSimpleQuestions', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var limit = req.body.limit;
	var errorMessage = '';

	connection.query('SELECT questions.* FROM questions WHERE project_id = ? AND category_id = 1 AND active = 1 ORDER BY RAND() LIMIT ?', [projectID, limit], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions!" + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/getRandomComplexQuestions', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var limit = req.body.limit;
	var errorMessage = '';

	connection.query('SELECT questions.* FROM questions WHERE project_id = ? AND category_id = 2 AND active = 1 ORDER BY RAND() LIMIT ?', [projectID, limit], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions!" + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/getRandomMixedQuestions', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var limit = req.body.limit;
	var errorMessage = '';

	connection.query('SELECT questions.* FROM questions WHERE project_id = ? AND active = 1 ORDER BY RAND() LIMIT ?', [projectID, limit], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions!" + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/getAnswers', isLoggedIn, function(req, res, next) {
	var questionid = req.body.id;
	var errorMessage = '';

	connection.query('SELECT * FROM answers WHERE question_id = ? ORDER BY RAND()', [questionid], function(answersErr,answers){
		if(answersErr) {
			errorMessage = "Error retrieving answers!" + answersErr;
		}
		
		res.json({errorMessage: errorMessage, answers: answers})
	});
});

router.post('/checkIfTestExists', isLoggedIn, function(req, res, next) {
	var testName = req.body.testName;
	var errorMessage = '';

	connection.query('SELECT tests.*, users.firstname, users.lastname, categories.category, projects.project FROM tests INNER JOIN users ON tests.created_by = users.id INNER JOIN test_questions ON tests.id = test_questions.test_id INNER JOIN questions ON test_questions.question_id = questions.id INNER JOIN categories ON questions.category_id = categories.id INNER JOIN projects on questions.project_id = projects.id WHERE tests.test = ? GROUP BY tests.id', [testName], function(existingTestErr,existingTest){
		if(existingTestErr) {
			errorMessage = "Error retrieving test info!" + existingTestErr;
		}
		res.json({errorMessage: errorMessage, existingTest : existingTest})
	});
});

router.post('/getLeaderboard', isLoggedIn, function(req, res, next) {
	var project = req.body.project;
	var errorMessage = '';

	connection.query('SELECT * FROM leaderboard WHERE project_id = ?', [project], function(leaderboardErr,leaderboard){
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

	connection.query('SELECT * FROM leaderboard_by_day WHERE project_id = ? AND date = ?', [project, today], function(leaderboardTodayErr,leaderboardToday){
		if(leaderboardTodayErr) {
			errorMessage = "Error retrieving leaderboard! " + leaderboardTodayErr;
		}
				
		res.json({errorMessage: errorMessage, leaderboardToday : leaderboardToday})
	});
});

router.post('/startTest', isLoggedIn, function(req, res, next) {
	var testName = req.body.test.test;
	var errorMessage = '';

	connection.query('INSERT INTO test_sessions (user_id, test) VALUES(?,?)', [req.user.id, testName], function(testSessionErr,testSession){
		if(testSessionErr) {
			errorMessage = "Error creating session!" + testSessionErr;
		}
		
		res.json({errorMessage: errorMessage, sessionID : testSession.insertId})
	});
});

router.post('/finishTest', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var errorMessage = '';
	var successMessage = '';

	connection.query('UPDATE test_sessions SET test_completed = 1 WHERE id = ?', [sessionID], function(completedSessionErr,completedSession){
		if(completedSessionErr) {
			errorMessage = "Error creating session!" + completedSessionErr;
		}

		if(errorMessage == ''){
			successMessage = 'Test completed successfully!!';
		}
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/deleteTest', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var errorMessage = '';
	var successMessage = '';

	connection.query('DELETE FROM test_sessions WHERE id = ?', [sessionID], function(deletedSessionErr,deletedSession){
		if(deletedSessionErr) {
			errorMessage = "Error deleting session!" + deletedSessionErr;
		}

		if(errorMessage == ''){
			successMessage = 'Test deleted successfully!!';
		}
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/submitAnswer', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var questionID = req.body.questionID;
	var answerID = req.body.answerID;
	var duration = req.body.duration;
	var autoSelected = req.body.autoSelected;
	var errorMessage = '';

	connection.query('INSERT INTO test_answers (session_id, question_id, answer_id, auto_selected) VALUES(?,?,?,?)', [sessionID, questionID, answerID, autoSelected], function(testAnswerErr,testAnswer){
		if(testAnswerErr) {
			errorMessage = "Error submitting answer! " + testAnswerErr;
		}
		else{
			connection.query('UPDATE test_sessions SET finish = CURRENT_TIMESTAMP(), duration = ? WHERE id = ?', [duration, sessionID], function(updatedSessionErr,updatedSession){
				if(updatedSessionErr) {
					errorMessage = "Error submitting answer!" + updatedSessionErr;
				}
				
				res.json({errorMessage: errorMessage})
			});
		}
	});
});

router.post('/getResults', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var errorMessage = '';

	connection.query('SELECT * FROM test_results WHERE id = ?', [sessionID], function(testResultsErr,testResults){
		if(testResultsErr) {
			errorMessage = "Error retrieving test results! " + testResultsErr;
		}
				
		res.json({errorMessage: errorMessage, testResults : testResults[0]})
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

router.post('/getQuestionAnswers', isLoggedIn, function(req, res, next) {
	var sessionID = req.body.sessionID;
	var questionID = req.body.questionID;
	var errorMessage = '';

	connection.query('SELECT test_answers.*, questions.question, answers.answer, answers.correct, all_answers.answer as `correct_answer` FROM test_answers INNER JOIN questions ON test_answers.question_id = questions.id INNER JOIN answers ON test_answers.answer_id = answers.id LEFT JOIN answers all_answers ON questions.id = all_answers.question_id AND all_answers.correct = 1 WHERE session_id = ? AND test_answers.question_id = ?', [sessionID, questionID], function(questionAnswersErr,questionAnswers){
		if(questionAnswersErr) {
			errorMessage = "Error retrieving test results! " + questionAnswersErr;
		}
				
		res.json({errorMessage: errorMessage, questionAnswers : questionAnswers[0]})
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
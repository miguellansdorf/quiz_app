var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

router.get('/', isLoggedIn, function(req, res, next) {
  res.render('edit-test', { title: 'Edit Questions & Tests', user : req.user });
});

router.post('/getTests', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
    var errorMessage = '';

	connection.query('SELECT tests.*, users.firstname, users.lastname FROM tests INNER JOIN users ON tests.created_by = users.id WHERE project_id = ? GROUP BY tests.id', [projectID], function(testsErr,tests){
		if(testsErr) {
			errorMessage = "Error retrieveing tests! " + testsErr;
		}
	
		res.json({errorMessage: errorMessage, tests: tests})
	});
});

router.post('/createTest', isLoggedIn, function(req, res, next) {
    var test = req.body.test;
    var project = req.body.project;

    var errorMessage = '';
    var successMessage = '';

    connection.query('INSERT INTO tests (created_by, project_id, test) VALUES(?, ?, ?)', [req.user.id, project, test], function(newTestErr, newTest) {
        if (newTestErr) {
            errorMessage = "Error creating " + test + "! " + newTestErr;
        } 

        if (errorMessage == '') {
            successMessage = test + " has been created successfully and is now ready for use!!";
        }

        res.json({ errorMessage: errorMessage, successMessage: successMessage })
    });
});

router.post('/deleteTest', isLoggedIn, function(req, res, next) {
    var testID = req.body.id;
	var testName = req.body.test;

    var errorMessage = '';
    var successMessage = '';

	if(req.user.role_id == 3){
		connection.query('DELETE FROM tests WHERE id = ?', [testID], function(deletedTestErr, deletedTest) {
			if (deletedTestErr) {
				errorMessage = "Error deleting " + testName + "! " + deletedTestErr;
			} 

			if (errorMessage == '') {
				successMessage = testName + " has been successfully deleted!!";
			}

			res.json({ errorMessage: errorMessage, successMessage: successMessage })
		});
	}
	else{
		errorMessage = "You do not have the privileges to delete tests!!";
		res.json({ errorMessage: errorMessage, successMessage: successMessage })
	}
});

router.post('/getQuestions', isLoggedIn, function(req, res, next) {
	var projectID = req.body.projectID;
	var errorMessage = '';

	connection.query('SELECT questions.*, users.firstname, users.lastname, categories.category, projects.project FROM questions INNER JOIN users ON questions.created_by = users.id INNER JOIN categories ON questions.category_id = categories.id INNER JOIN projects on questions.project_id = projects.id WHERE project_id = ? ORDER BY category_id, project_id', [projectID], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions " + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/addQuestion', isLoggedIn, function(req, res, next) {
    var question = req.body.question;
    var duration = req.body.duration;
	var image = req.body.image;
    var projectID = req.body.projectID;
    var answer1 = req.body.answers.answer1;
    var answer1Correct = req.body.answers.answer1Correct;
    var answer2 = req.body.answers.answer2;
    var answer2Correct = req.body.answers.answer2Correct;
    var answer3 = req.body.answers.answer3;
    var answer3Correct = req.body.answers.answer3Correct;
    var answer4 = req.body.answers.answer4;
    var answer4Correct = req.body.answers.answer4Correct;
    var category = req.body.category;

    var errorMessage = '';
    var successMessage = '';

    connection.query('INSERT INTO questions (category_id, project_id, created_by, question, duration, image) VALUES(?, ?, ?, ?, ?, ?)', [category, projectID, req.user.id, question, duration, image], function(newQuestionErr, newQuestion) {
        if (newQuestionErr) {
            errorMessage = "Error creating " + question + "! " + newQuestionErr;
        } else {
            connection.query('INSERT INTO answers (question_id, created_by, answer, correct) VALUES(?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)', [newQuestion.insertId, req.user.id, answer1, answer1Correct, newQuestion.insertId, req.user.id, answer2, answer2Correct, newQuestion.insertId, req.user.id, answer3, answer3Correct, newQuestion.insertId, req.user.id, answer4, answer4Correct], function(answersErr, answers) {
                if (answersErr) {
                    errorMessage = "Error adding answers to question: " + question + "! " + answersErr;
                }

                if (errorMessage == '') {
                    successMessage = question + " has been created successfully!!";
                }

                res.json({ errorMessage: errorMessage, successMessage: successMessage })
            });
        }
    });
});

router.post('/deactivateQuestion', isLoggedIn, function(req, res, next) {
	var questionID = req.body.id;
	var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE questions SET active = 0 WHERE id = ?', [questionID], function(deactivatedQuestionErr,deactivatedQuestion){
		if(deactivatedQuestionErr) {
			errorMessage = "Error deactivating question! Please try again!!" + deactivatedQuestionErr;
		}
		if(errorMessage == ''){
            successMessage = 'Question "' + question +'" deactivated successfully';
        }
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/activateQuestion', isLoggedIn, function(req, res, next) {
	var questionID = req.body.id;
	var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE questions SET active = 1 WHERE id = ?', [questionID], function(activatedQuestionErr,activatedQuestion){
		if(activatedQuestionErr) {
			errorMessage = "Error activating question! Please try again!!" + activatedQuestionErr;
		}
		if(errorMessage == ''){
            successMessage = 'Question "' + question +'" activated successfully';
        }
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/deleteQuestion', isLoggedIn, function(req, res, next) {
	var questionID = req.body.id;
    var question = req.body.question;

    var errorMessage = '';
    var successMessage = '';
	
	if(req.user.role_id == 3){
		connection.query('DELETE FROM questions WHERE id = ?', [questionID], function(deletedQuestionErr, deletedQuestion) {
			if (deletedQuestionErr) {
				errorMessage = "Error deleting " + question + "! " + deletedQuestionErr;
			} 

			if (errorMessage == '') {
				successMessage = question + " has been successfully deleted!!";
			}

			res.json({ errorMessage: errorMessage, successMessage: successMessage })
		});
	}
	else{
		errorMessage = "You do not have the privileges to delete tests!!";
		res.json({ errorMessage: errorMessage, successMessage: successMessage })
	}
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

router.post('/getTestQuestions', isLoggedIn, function(req, res, next) {
	var testid = req.body.id;
	var errorMessage = '';

	connection.query('SELECT questions.*, users.firstname, users.lastname, categories.category, projects.project FROM questions INNER JOIN users ON questions.created_by = users.id INNER JOIN categories ON questions.category_id = categories.id INNER JOIN test_questions ON questions.id = test_questions.question_id INNER JOIN projects on questions.project_id = projects.id WHERE test_questions.test_id = ? ORDER BY questions.id', [testid], function(questionsErr,questions){
		if(questionsErr) {
			errorMessage = "Error retrieving questions!" + questionsErr;
		}
		
		res.json({errorMessage: errorMessage, questions: questions})
	});
});

router.post('/getAnswers', isLoggedIn, function(req, res, next) {
	var questionid = req.body.id;
	var errorMessage = '';

	connection.query('SELECT * FROM answers WHERE question_id = ?', [questionid], function(answersErr,answers){
		if(answersErr) {
			errorMessage = "Error retrieving answers!" + answersErr;
		}
		
		res.json({errorMessage: errorMessage, answers: answers})
	});
});

router.post('/updateQuestion', isLoggedIn, function(req, res, next) {
	var question = req.body.question;
    var answers = req.body.answers;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE questions SET question = ?, project_id = ?, duration = ?, image = ? WHERE id = ?', [question.question, question.project_id, question.duration, question.image, question.id], function(updatedQuestionErr,updatedQuestion){
		if(updatedQuestionErr) {
			errorMessage = "Error updating " + question.question + "! " + updatedQuestionErr;
		}
        else{
			answers.forEach(function (answer) {
				connection.query('UPDATE answers SET answer = ?, correct = ? WHERE id = ?', [answer.answer, answer.correct, answer.id], function(updatedAnswerErr,updatedAnswer){
					if(updatedAnswerErr) {
						errorMessage = "Error updating " + question.question + "! " + updatedAnswerErr;
					}
				});
			})
        }

		if(errorMessage == ''){
			successMessage = question.question + " updated successfully!";
		}
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/deactivateTest', isLoggedIn, function(req, res, next) {
	var testid = req.body.id;
    var testname = req.body.test;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE tests SET active = 0 WHERE id = ?', [testid], function(updatedTestErr,updatedTest){
		if(updatedTestErr) {
			errorMessage = "Error updating " + testname + "! " + updatedTestErr;
		}
        else{
            successMessage = testname + " deactivated successfully!";
        }
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/activateTest', isLoggedIn, function(req, res, next) {
	var testid = req.body.id;
    var testname = req.body.test;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE tests SET active = 1 WHERE id = ?', [testid], function(updatedTestErr,updatedTest){
		if(updatedTestErr) {
			errorMessage = "Error updating " + testname + "! " + updatedTestErr;
		}
        else{
            successMessage = testname + " activated successfully!";
        }
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/removeTestQuestion', isLoggedIn, function(req, res, next) {
	var test = req.body.test;
    var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('DELETE FROM test_questions WHERE test_id = ? AND question_id = ?', [test.id, question.id], function(updatedTestErr,updatedTest){
		if(updatedTestErr) {
			errorMessage = "Error updating " + test.test + "! " + updatedTestErr;
		}
        else{
            successMessage = test.test + " updated successfully!";
        }
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/addTestQuestion', isLoggedIn, function(req, res, next) {
	var test = req.body.test;
    var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('INSERT INTO test_questions (test_id, question_id) VALUES(?,?)', [test.id, question.id], function(updatedTestErr,updatedTest){
		if(updatedTestErr) {
			errorMessage = "Error adding " + question.question + " to " + test.test + "! " + updatedTestErr;
		}
        else{
            successMessage = question.question + " successfully added to " + test.test +"!";
        }
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/updateTestName', isLoggedIn, function(req, res, next) {
	var testid = req.body.id;
    var testname = req.body.test;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE tests SET test = ? WHERE id = ?', [testname, testid], function(updatedTestErr,updatedTest){
		if(updatedTestErr) {
			errorMessage = "Error updating " + testname + "! " + updatedTestErr;
		}
        else{
            successMessage = testname + " updated successfully!";
        }
		
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

module.exports = router;

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated() && req.user.role_id != 1)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
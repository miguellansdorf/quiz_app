var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage })

connection.query('USE ' + dbconfig.database);

router.get('/', isLoggedIn, function(req, res, next) {
    res.render('create-test', { title: 'Create Questions & Tests', user: req.user });
});

router.get('/getProjects', isLoggedIn, function(req, res, next) {
    var errorMessage = '';

    connection.query('SELECT * FROM projects', function(projectsErr, projects) {
        if (projectsErr) {
            errorMessage = "Error retrieving projects " + projectsErr;
        }

        res.json({ errorMessage: errorMessage, projects: projects, angularUser: req.user })
    });
});

router.post('/createProject', isLoggedIn, function(req, res, next) {
    var project = req.body.project;
    var errorMessage = '';
    var successMessage = '';

    connection.query('SELECT * FROM projects WHERE project = ?', [project], function(existingProjectErr, existingProject) {
        if (existingProjectErr) {
            errorMessage = "Error retrieving projects " + existingProjectErr;
        }
        else{
            if(existingProject.length == 0){
                connection.query('INSERT INTO projects (project) VALUES (?)', [project], function(newProjectErr, newProject) {
                    if (newProjectErr) {
                        errorMessage = "Error retrieving projects " + newProjectErr;
                    }

                    if(errorMessage == ''){
                        successMessage = "Project \"" + project + "\" created successfully!!";
                    }

                    res.json({ errorMessage: errorMessage, successMessage: successMessage, newProject: newProject })
                });
            }
            else{
                errorMessage = "Project \"" + project + "\" already exists!! Please select a different name!";
                res.json({ errorMessage: errorMessage, successMessage: successMessage })
            }
        }
    });
});

router.post('/getQuestions', isLoggedIn, function(req, res, next) {
    var testcategory = req.body.category;
    var projectID = req.body.projectID;
    var errorMessage = '';

    if (testcategory == "Simple") {
        testcategory = 1;
    } else {
        testcategory = 2;
    }

    connection.query('SELECT questions.*, users.firstname, users.lastname, projects.project FROM questions INNER JOIN users ON questions.created_by = users.id INNER JOIN projects on questions.project_id = projects.id WHERE category_id = ? AND project_id = ? ORDER BY project_id', [testcategory, projectID], function(questionsErr, questions) {
        if (questionsErr) {
            errorMessage = "Error retrieving questions " + questionsErr;
        }

        res.json({ errorMessage: errorMessage, questions: questions })
    });
});

router.post('/addQuestion', isLoggedIn, function(req, res, next) {
    var question = req.body.question;
    var duration = req.body.duration;
    var projectID = req.body.projectID;
    var image = req.body.image;
    var answer1 = req.body.answers.answer1;
    var answer1Correct = req.body.answers.answer1Correct;
    var answer2 = req.body.answers.answer2;
    var answer2Correct = req.body.answers.answer2Correct;
    var answer3 = req.body.answers.answer3;
    var answer3Correct = req.body.answers.answer3Correct;
    var answer4 = req.body.answers.answer4;
    var answer4Correct = req.body.answers.answer4Correct;
    var testcategory = req.body.category;

    if (testcategory == "Simple") {
        testcategory = 1;
    } else {
        testcategory = 2;
    }

    var errorMessage = '';
    var successMessage = '';

    connection.query('INSERT INTO questions (category_id, project_id, created_by, question, duration, image) VALUES(?, ?, ?, ?, ?, ?)', [testcategory, projectID, req.user.id, question, duration, image], function(newQuestionErr, newQuestion) {
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

router.post('/createTest', isLoggedIn, function(req, res, next) {
    var testName = req.body.testName;
    var questions = req.body.questions;
    var project = req.body.project;

    var errorMessage = '';
    var successMessage = '';

    connection.query('INSERT INTO tests (created_by, project_id, test) VALUES(?, ?, ?)', [req.user.id, project, testName], function(newTestErr, newTest) {
        if (newTestErr) {
            errorMessage = "Error creating " + testName + "! " + newTestErr;
        } else {
            questions.forEach(function(question) {
                connection.query('INSERT INTO test_questions (test_id, question_id) VALUES(?, ?)', [newTest.insertId, question.id], function(testQuestionErr, testQuestion) {
                    if (testQuestionErr) {
                        errorMessage = "Error creating " + testName + "! " + testQuestionErr;
                    }
                });
            });
        }

        if (errorMessage == '') {
            successMessage = testName + " has been created successfully and is now ready for use!!";
        }

        res.json({ errorMessage: errorMessage, successMessage: successMessage, testId: newTest.insertId })
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

	connection.query('UPDATE questions SET question = ?, duration = ?, image = ? WHERE id = ?', [question.question, question.duration, question.image, question.id], function(updatedQuestionErr,updatedQuestion){
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

router.post('/deactivateQuestion', isLoggedIn, function(req, res, next) {
	var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE questions SET active = 0 WHERE id = ?', [question.id], function(deactivatedQuestionErr,deactivatedQuestion){
		if(deactivatedQuestionErr) {
			errorMessage = "Error deactivating question! Please try again!!" + deactivatedQuestionErr;
		}
		if(errorMessage == ''){
            successMessage = 'Question "' + question.question +'" deactivated successfully';
        }
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/activateQuestion', isLoggedIn, function(req, res, next) {
	var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

	connection.query('UPDATE questions SET active = 1 WHERE id = ?', [question.id], function(activatedQuestionErr,activatedQuestion){
		if(activatedQuestionErr) {
			errorMessage = "Error activating question! Please try again!!" + activatedQuestionErr;
		}
		if(errorMessage == ''){
            successMessage = 'Question "' + question.question +'" activated successfully';
        }
		res.json({errorMessage: errorMessage, successMessage: successMessage})
	});
});

router.post('/deleteQuestion', isLoggedIn, function(req, res, next) {
	var question = req.body.question;
	var errorMessage = '';
    var successMessage = '';

    if(req.user.role_id == 3){
        connection.query('DELETE FROM questions WHERE id = ?', [question.id], function(deletedQuestionErr, deletedQuestion){
            if(deletedQuestionErr) {
                errorMessage = "Error deleting question! Please try again!!" + deletedQuestionErr;
            }
            if(errorMessage == ''){
                successMessage = 'Question "' + question.question +'" deleted successfully';
            }
            res.json({errorMessage: errorMessage, successMessage: successMessage})
        });
    }
    else{
        errorMessage = "You do not have the privileges to delete questions!!";
        res.json({errorMessage: errorMessage, successMessage: successMessage})
    }
});

router.post('/upload', upload.any(), function(req, res, next) {
    res.json({success:true})
});

module.exports = router;

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.role_id != 1)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
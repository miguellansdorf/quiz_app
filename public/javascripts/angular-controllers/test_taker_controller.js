var app = angular.module('test-taker',[]);

app.controller('myController', function($scope, $http, $interval) {
	$scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.angularUser = '';
    $scope.projects = [];
    $scope.simpleTests = [];
    $scope.complexTests = [];
    $scope.simpleCount = 0;
    $scope.complexCount = 0;
    $scope.test = {project: 1};
    $scope.loadingTests = true;
    $scope.random = {simpleQuestionsCount: 10, complexQuestionsCount: 10, mixedQuestionsCount: 10};
    $scope.questions = [];
    $scope.answers = [];
    $scope.loadingQuestions = true;

    $scope.selectedTestName = '';
    $scope.selectedTest = '';
    $scope.selectedQuestion = '';
    $scope.questionIndex = 0;
    $scope.questionAnswered = false;
    $scope.questionAnswers = '';
    var questionTimer;

    //Session Info
    var sessionTimer;
    $scope.sessionTime = 0;
    $scope.sessionSeconds = 0;
    $scope.sessionMinutes = 0;
    $scope.sessionHours = 0;
    $scope.sessionID = '';
    $scope.testFinished = false;
    $scope.testResults = '';
    $scope.resultAnswers = '';

    $scope.leaderboard = [];
    $scope.loadingLeaderboard = true;
    $scope.leaderboardToday = [];
    $scope.loadingLeaderboardToday = true;

    //Timer for automatically clearing error and success messages
    var clearMessageTimer;
    $scope.clearMessageCounter = 0;

    $scope.$watchGroup(['successMessage', 'errorMessage'], function(newValues, oldValues) {
        if(newValues[0] || newValues[1]){
            clearMessageTimer = $interval(function() {$scope.clearMessageCounter = $scope.clearMessageCounter + 1;}, 1000);
        }
    });

    $scope.$watch('clearMessageCounter', function(newValue, oldValue) {
        if(newValue == 5){
            $scope.clearMessageCounter = 0;
            $interval.cancel(clearMessageTimer);
            $scope.successMessage = '';
            $scope.errorMessage = '';
        }
    });

    $scope.getProjects = function() {
        $http({
            method: 'GET',
            url: '/take-test/getProjects'
        }).then(function successCallback(response){
            $scope.projects = response.data.projects;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    //Get tests
    $scope.loadTests = function(projectID){
        $scope.loadingTests = true;
        $scope.getSimpleTests(projectID);
        $scope.getComplexTests(projectID);
        $scope.getTestQuestionsCount(projectID);
        $scope.loadingTests = false;;
    }

    $scope.getSimpleTests = function(projectID) {
        var data = {projectID:projectID};
        $http({
            method: 'POST',
            url: '/take-test/getSimpleTests',
            data: data
        }).then(function successCallback(response){

            for(var i = 0; i < response.data.simpleTests.length; i++){
                response.data.simpleTests[i].creation_time = prettyDate(response.data.simpleTests[i].creation_time);
            }

            $scope.simpleTests = response.data.simpleTests;
            $scope.angularUser = response.data.angularUser;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.getComplexTests = function(projectID) {
        var data = {projectID:projectID};
        $http({
            method: 'POST',
            url: '/take-test/getComplexTests',
            data: data
        }).then(function successCallback(response){

            for(var i = 0; i < response.data.complexTests.length; i++){
                response.data.complexTests[i].creation_time = prettyDate(response.data.complexTests[i].creation_time);
            }

            $scope.complexTests = response.data.complexTests;
            $scope.angularUser = response.data.angularUser;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.getTestQuestionsCount = function(projectID) {
        var data = {projectID:projectID};
        $http({
            method: 'POST',
            url: '/take-test/getTestQuestionsCount',
            data: data
        }).then(function successCallback(response){
            $scope.simpleCount = response.data.simpleCount.count;
            $scope.random.simpleQuestionsCount = response.data.simpleCount.count;

            $scope.complexCount = response.data.complexCount.count;
            $scope.random.complexQuestionsCount = response.data.complexCount.count;

            $scope.random.mixedQuestionsCount = response.data.simpleCount.count + response.data.complexCount.count;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.getProjects();

    $scope.selectTest = function(testName){
        $scope.selectedTestName = testName;

        if(!$scope.random.simpleQuestionsCount || $scope.random.simpleQuestionsCount > $scope.simpleCount){
            $scope.random.simpleQuestionsCount = $scope.simpleCount;
        }

        if(!$scope.random.complexQuestionsCount || $scope.random.complexQuestionsCount > $scope.complexCount){
            $scope.random.complexQuestionsCount = $scope.complexCount;
        }

        if(!$scope.random.mixedQuestionsCount || $scope.random.mixedQuestionsCount > ($scope.simpleCount + $scope.complexCount)){
            $scope.random.mixedQuestionsCount = $scope.simpleCount + $scope.complexCount;
        }

        switch(testName){
            case "Random Simple Test":
                $scope.selectedTest = {active: 1, category: "Simple", created_by: $scope.angularUser.id, creation_time: moment().format('YYYY-MM-DD HH:mm:ss'), firstname: $scope.angularUser.firstname, id:0, lastname: $scope.angularUser.lastname, test: "Random Simple Test"};
                $scope.getRandomSimpleQuestions($scope.test.project, $scope.random.simpleQuestionsCount);
            break;

            case "Random Complex Test":
                $scope.selectedTest = {active: 1, category: "Complex", created_by: $scope.angularUser.id, creation_time: moment().format('YYYY-MM-DD HH:mm:ss'), firstname: $scope.angularUser.firstname, id:0, lastname: $scope.angularUser.lastname, test: "Random Complex Test"};
                $scope.getRandomComplexQuestions($scope.test.project, $scope.random.complexQuestionsCount);
            break;

            case "Random Mixed Test":
                $scope.selectedTest = {active: 1, category: "Mixed", created_by: $scope.angularUser.id, creation_time: moment().format('YYYY-MM-DD HH:mm:ss'), firstname: $scope.angularUser.firstname, id:0, lastname: $scope.angularUser.lastname, test: "Random Mixed Test"};
                $scope.getRandomMixedQuestions($scope.test.project, $scope.random.mixedQuestionsCount);
            break;

            default:
                $scope.checkIfTestExists(testName);
            break;
        }

        $scope.getLeaderboard();
        $scope.getLeaderboardToday();
    }

    $scope.unselectTest = function(){
        $scope.selectedTestName = '';
        $scope.selectedTest = '';
        $scope.selectedQuestion = '';
        $scope.answers = [];
        $scope.leaderboard = [];
        $scope.loadingLeaderboard = true;
        $scope.leaderboardToday = [];
        $scope.loadingLeaderboardToday = true;
    }

    $scope.checkIfTestExists = function(testName){
        var data = {testName: testName};
        $http({
            method: 'POST',
            url: '/take-test/checkIfTestExists',
            data: data
        }).then(function successCallback(response){
            if(response.data.existingTest.length > 0){
                for(var i = 0; i < response.data.existingTest.length; i++){
                    response.data.existingTest[i].creation_time = prettyDate(response.data.existingTest[i].creation_time); 
                }
                $scope.selectedTest = response.data.existingTest[0];
                console.log($scope.selectedTest);
                $scope.getQuestions($scope.selectedTest);
            }
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }    

    $scope.getQuestions = function(test) {
        $scope.loadingQuestions = true;
        $http({
            method: 'POST',
            url: '/take-test/getQuestions',
            data: test
        }).then(function successCallback(response){
            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getRandomSimpleQuestions = function(projectID, limit) {
        $scope.loadingQuestions = true;
        var data = {projectID:projectID, limit:limit};
        $http({
            method: 'POST',
            url: '/take-test/getRandomSimpleQuestions',
            data: data
        }).then(function successCallback(response){
            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getRandomComplexQuestions = function(projectID, limit) {
        $scope.loadingQuestions = true;
        var data = {projectID:projectID, limit:limit};
        $http({
            method: 'POST',
            url: '/take-test/getRandomComplexQuestions',
            data: data
        }).then(function successCallback(response){
            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getRandomMixedQuestions = function(projectID, limit) {
        $scope.loadingQuestions = true;
        var data = {projectID:projectID, limit:limit};
        $http({
            method: 'POST',
            url: '/take-test/getRandomMixedQuestions',
            data: data
        }).then(function successCallback(response){
            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getAnswers = function(question) {
        $http({
            method: 'POST',
            url: '/take-test/getAnswers',
            data: question
        }).then(function successCallback(response){
            $scope.answers = response.data.answers;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.startTest = function(test) {
        var data = {test:test};
        $http({
            method: 'POST',
            url: '/take-test/startTest',
            data: data
        }).then(function successCallback(response){
            $scope.sessionID = response.data.sessionID;
            $scope.selectedQuestion = $scope.questions[$scope.questionIndex];
            $scope.getAnswers($scope.selectedQuestion);
            sessionTimer = $interval(calculateSessionTime, 1000);
            questionTimer = $interval(questionDuration, 1000);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.finishTest = function() {
        $http({
            method: 'POST',
            url: '/take-test/finishTest',
            data: {sessionID: $scope.sessionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getLeaderboard();
            $scope.getLeaderboardToday();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deleteTest = function() {
        $http({
            method: 'POST',
            url: '/take-test/deleteTest',
            data: {sessionID: $scope.sessionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getLeaderboard = function(){
        $http({
            method: 'POST',
            url: '/take-test/getLeaderboard',
            data: {project: $scope.test.project}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.leaderboard = response.data.leaderboard;
            $scope.loadingLeaderboard = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getLeaderboardToday = function(){
        $http({
            method: 'POST',
            url: '/take-test/getLeaderboardToday',
            data: {project: $scope.test.project, today: moment().format('YYYY-MM-DD')}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.leaderboardToday = response.data.leaderboardToday;
            $scope.loadingLeaderboardToday = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    //Calculate question duration
    function questionDuration() {
        $scope.selectedQuestion.duration -= 1;
    }

    $scope.$watch('selectedQuestion.duration', function(newValue, oldValue) {
        if(newValue == 0){
            $interval.cancel(questionTimer);
            for(var i = 0; i < $scope.answers.length; i++){
                if($scope.answers[i].correct == 0){
                    $scope.submitAnswer($scope.answers[i], 1);
                    break;
                }
            }
        }
    });

    //Calculate session time
    function calculateSessionTime() {
        $scope.sessionTime += 1;
        $scope.sessionSeconds = ($scope.sessionTime % 60);
        $scope.sessionMinutes = Math.trunc((($scope.sessionTime / 60) % 60));
        $scope.sessionHours = Math.trunc(($scope.sessionTime / 3600));
    }

    $scope.getResults = function(sessionID){
        $http({
            method: 'POST',
            url: '/take-test/getResults',
            data: {sessionID : sessionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.testResults = response.data.testResults;
            $scope.getResultAnswers(sessionID);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getResultAnswers = function(sessionID){
        $http({
            method: 'POST',
            url: '/take-test/getResultAnswers',
            data: {sessionID : sessionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.resultAnswers = response.data.resultAnswers;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.submitAnswer = function(answer, autoSelected){
        var data = {sessionID : $scope.sessionID, questionID : $scope.selectedQuestion.id, answerID : answer.id, duration : $scope.sessionTime, autoSelected: autoSelected};
        $http({
            method: 'POST',
            url: '/take-test/submitAnswer',
            data: data
        }).then(function successCallback(response){
            $interval.cancel(sessionTimer);
            $interval.cancel(questionTimer);
            $scope.questionAnswered = true;
            $scope.getQuestionAnswers(data);
            if($scope.questionIndex == $scope.questions.length - 1){
                $scope.testFinished = true;
                $scope.leaderboard = [];
                $scope.loadingLeaderboard = true;
                $scope.leaderboardToday = [];
                $scope.loadingLeaderboardToday = true;
                $scope.finishTest();
            }
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getQuestionAnswers = function(data){
        $http({
            method: 'POST',
            url: '/take-test/getQuestionAnswers',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.questionAnswers = response.data.questionAnswers;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.nextQuestion = function(){
        $scope.questionIndex += 1;
        $scope.questionAnswers = '';
        if($scope.questionIndex == $scope.questions.length){
            $scope.getResults($scope.sessionID);
        }
        else{
            $scope.selectedQuestion = $scope.questions[$scope.questionIndex];
            $scope.getAnswers($scope.selectedQuestion);
            $scope.questionAnswered = false;
            sessionTimer = $interval(calculateSessionTime, 1000);
            questionTimer = $interval(questionDuration, 1000);
        }
    }

    window.onbeforeunload = function(){
        if($scope.sessionID != '' && !$scope.testFinished){
            $scope.deleteTest();
        }
        return null;
    } 
});
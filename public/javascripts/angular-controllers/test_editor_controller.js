var app = angular.module('test-editor',[]);

app.controller('myController', ['$scope', '$http', '$interval', 'fileUpload', function($scope, $http, $interval, fileUpload) {
    $scope.errorMessage = '';
    $scope.successMessage = '';

    $scope.answerCorrect = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];
    $scope.categories = [{id: 1, value:"Simple"}, {id: 2, value:"Complex"}];
    $scope.projects = [];

    //Test variables
    $scope.tests = [];
    $scope.loadingTests = true;
    $scope.selectedTest = '';
    $scope.testQuestions = [];
    $scope.loadingTestQuestions = true;

    //Question variables
    $scope.questions = [];
    $scope.loadingQuestions = true;
    $scope.selectedQuestion = '';
    $scope.questionAnswers = '';
    $scope.loadingQuestionsAnswers = true;

    $scope.filter = {project:"", test: "", question: ""};

    $scope.newQuestion = false;
    $scope.question = {question:'', duration:20, category: 1, image: null};
    $scope.answers = {answer1:'', answer1Correct: 1, answer2:'', answer2Correct: 0, answer3:'', answer3Correct: 0, answer4:'', answer4Correct: 0};

    $scope.newTest = false;
    $scope.test = {test: ''};

    //Image variables
    $scope.updateImageOptions = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];
    $scope.updateImage = {value: 0};
    $scope.newImage = {image:''};

    $scope.$watch('newImage.image', function(newValue, oldValue) {
        if(newValue != ''){
            $scope.updateImage.value = 1;
        }
    });

    $scope.uploadPic = function (file) {
        var uploadUrl = '/create-test/upload';
        fileUpload.post(uploadUrl, file);
    };

    //Timer for automatically clearing error and success messages
    var clearMessageTimer;
    $scope.clearMessageCounter = 0;

    $scope.$watchGroup(['successMessage', 'errorMessage'], function(newValues, oldValues) {
        if(newValues[0] || newValues[1]){
            clearMessageTimer = $interval(function() {$scope.clearMessageCounter = $scope.clearMessageCounter + 1;}, 1000);
        }
    });

    $scope.$watch('clearMessageCounter', function(newValue, oldValue) {
        if(newValue == 10){
            $scope.clearMessageCounter = 0;
            $interval.cancel(clearMessageTimer);
            $scope.successMessage = '';
            $scope.errorMessage = '';
        }
    });

    $scope.getProjects = function(){
        $http({
            method: 'GET',
            url: '/edit-test/getProjects',
        }).then(function successCallback(response){
            $scope.projects = response.data.projects;
            if($scope.projects.length > 0){
                $scope.filter.project = $scope.projects[0].id;
            }
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getProjects();

    //Get tests
    $scope.getTests = function() {
        $scope.tests = [];
        $scope.loadingTests = true;
        $scope.selectedTest = '';
        $scope.testQuestions = [];
        $scope.loadingTestQuestions = true;
        $http({
            method: 'POST',
            url: '/edit-test/getTests',
            data: {projectID: $scope.filter.project}
        }).then(function successCallback(response){

            for(var i = 0; i < response.data.tests.length; i++){
                response.data.tests[i].creation_time = prettyDate(response.data.tests[i].creation_time);
            }

            $scope.tests = response.data.tests;
            $scope.loadingTests = false;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.createTest = function(){
        $http({
            method: 'POST',
            url: '/edit-test/createTest',
            data: {project: $scope.filter.project, test: $scope.test.test}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getTests();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deleteTest = function(test){
        $http({
            method: 'POST',
            url: '/edit-test/deleteTest',
            data: test
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getTests();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }    

    //Get Questions
    $scope.getQuestions = function() {
        $scope.questions = [];
        $scope.loadingQuestions = true;
        $scope.selectedQuestion = '';
        $scope.questionAnswers = '';
        $scope.loadingQuestionsAnswers = true;
        $http({
            method: 'POST',
            url: '/edit-test/getQuestions',
            data: {projectID: $scope.filter.project}
        }).then(function successCallback(response){

            for(var i = 0; i < response.data.questions.length; i++){
                response.data.questions[i].creation_time = prettyDate(response.data.questions[i].creation_time);
            }

            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.addQuestion = function(){
        if($scope.question.question != '' && $scope.answers.answer1 != '' && $scope.answers.answer2 != '' && $scope.answers.answer3 != '' && $scope.answers.answer4 != '' && $scope.filter.project != ''){
            if($scope.question.duration < 10 || !$scope.question.duration){
                $scope.question.duration = 10;
            }

            var questionData = {};

            if($scope.question.image && $scope.question.image != null){
                $scope.uploadPic({image: $scope.question.image});
                questionData = {category: $scope.question.category, answers: $scope.answers, question: $scope.question.question, projectID: $scope.filter.project, duration: $scope.question.duration, image: $scope.question.image.name};
            }
            else{
                questionData = {category: $scope.question.category, answers: $scope.answers, question: $scope.question.question, projectID: $scope.filter.project, duration: $scope.question.duration, image: null};
            }

            $http({
                method: 'POST',
                url: '/edit-test/addQuestion',
                data: questionData
            }).then(function successCallback(response){
                $scope.errorMessage = response.data.errorMessage;
                $scope.successMessage = response.data.successMessage;
                $scope.answers = {answer1:'', answer1Correct: 1, answer2:'', answer2Correct: 0, answer3:'', answer3Correct: 0, answer4:'', answer4Correct: 0};
                $scope.question.question = '';
                $scope.question.duration = 20;
                $scope.question.image = null;
                $scope.getQuestions();
            }, function errorCallback(response){
                console.error("error in posting");
            });
        }
        else{
            $scope.errorMessage = "Not all required data has been entered to create a new question!!";
        }
    }

    $scope.deactivateQuestion = function(question) {
        $http({
            method: 'POST',
            url: '/edit-test/deactivateQuestion',
            data: question
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.activateQuestion = function(question) {
        $http({
            method: 'POST',
            url: '/edit-test/activateQuestion',
            data: question
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deleteQuestion = function(question){
        $http({
            method: 'POST',
            url: '/edit-test/deleteQuestion',
            data: question
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }  

    $scope.selectTest = function(test){
        $scope.selectedTest = test;

        $scope.getTestQuestions(test);
    }

    $scope.unselectTest = function(){
        $scope.selectedTest = '';
        $scope.testQuestions = [];
        $scope.testAnswers = [];
        $scope.loadingTestQuestions = true;
    }

    $scope.deactivateTest = function(test) {
        $http({
            method: 'POST',
            url: '/edit-test/deactivateTest',
            data: test
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;

            if(response.data.errorMessage == ''){
                $scope.selectedTest.active = 0;
            }

        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.activateTest = function(test) {
        $http({
            method: 'POST',
            url: '/edit-test/activateTest',
            data: test
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;

            if(response.data.errorMessage == ''){
                $scope.selectedTest.active = 1;
            }
            
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getTestQuestions = function(test) {
        $http({
            method: 'POST',
            url: '/edit-test/getTestQuestions',
            data: test
        }).then(function successCallback(response){
            $scope.testQuestions = response.data.questions;
            $scope.loadingTestQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.selectQuestion = function(question){
        $scope.selectedQuestion = question;

        $scope.getQuestionAnswers(question);
    }

    $scope.unselectQuestion = function(){
        $scope.selectedQuestion = '';
        $scope.questionAnswers = [];
        $scope.loadingQuestionsAnswers = true;
    }

    $scope.getQuestionAnswers = function(question) {
        $http({
            method: 'POST',
            url: '/edit-test/getAnswers',
            data: question
        }).then(function successCallback(response){
            $scope.questionAnswers = response.data.answers;
            $scope.loadingQuestionsAnswers = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.updateQuestion = function() {
        if($scope.selectedQuestion.duration < 10 || !$scope.selectedQuestion){
            $scope.selectedQuestion.duration = 10;
        }

        if($scope.updateImage.value == 1){
            if($scope.newImage.image && $scope.newImage.image != ''){
                $scope.uploadPic({image: $scope.newImage.image});
                $scope.selectedQuestion.image = $scope.newImage.image.name;
            }
            else{
                $scope.selectedQuestion.image = null;
            }
        }

        var data = {question: $scope.selectedQuestion, answers: $scope.questionAnswers};

        $http({
            method: 'POST',
            url: '/edit-test/updateQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.updateImage.value = 0;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.removeTestQuestion = function(question) {
        var data = {test: $scope.selectedTest, question: question};
        $http({
            method: 'POST',
            url: '/edit-test/removeTestQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.loadingTestQuestions = true;
            $scope.getTestQuestions($scope.selectedTest);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.addTestQuestion = function(question) {

        var alreadyInTest = false;

        for(var i = 0; i < $scope.testQuestions.length; i++){
            if(question.id == $scope.testQuestions[i].id){
                alreadyInTest = true;
                break;
            }
        }

        if(!alreadyInTest){
            var data = {test: $scope.selectedTest, question: question};
            $http({
                method: 'POST',
                url: '/edit-test/addTestQuestion',
                data: data
            }).then(function successCallback(response){
                $scope.errorMessage = response.data.errorMessage;
                $scope.successMessage = response.data.successMessage;
                $scope.loadingTestQuestions = true;
                $scope.getTestQuestions($scope.selectedTest);
            }, function errorCallback(response){
                console.error("error in posting");
            });
        }
        else{
            $scope.errorMessage = "Question \"" + question.question + "\" is already present in the selected test!";
        }
    }

    $scope.updateTestName = function(test) {
        $http({
            method: 'POST',
            url: '/edit-test/updateTestName',
            data: test
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.$watch('filter.project', function(newValue, oldValue) {
        if(newValue != oldValue){
            $scope.loadingTests = true;
            $scope.tests = [];
            $scope.getTests();
            $scope.loadingQuestions = true;
            $scope.questions = [];
            $scope.getQuestions();
        }
    });

    $scope.$watch('questionAnswers[0].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.questionAnswers[1].correct = 0;
            $scope.questionAnswers[2].correct = 0;
            $scope.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('questionAnswers[1].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.questionAnswers[0].correct = 0;
            $scope.questionAnswers[2].correct = 0;
            $scope.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('questionAnswers[2].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.questionAnswers[0].correct = 0;
            $scope.questionAnswers[1].correct = 0;
            $scope.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('questionAnswers[3].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.questionAnswers[0].correct = 0;
            $scope.questionAnswers[1].correct = 0;
            $scope.questionAnswers[2].correct = 0;
        }
    });
}]);

app.filter("testFilter", function() {
    return function(items, test, scope) {
        var result = items;

        if(test != ""){
            var temp = [];
            for(var i=0; i<result.length; i++){
                if(result[i].test.toLowerCase().indexOf(test.toLowerCase()) != -1){
                    temp.push(result[i]);
                }
            }
            result = temp;
        }
        
        return result;
    };
});

app.filter("questionFilter", function() {
    return function(items, question, scope) {
        var result = items;

        if(question != ""){
            var temp = [];
            for(var i=0; i<result.length; i++){
                if(result[i].question.toLowerCase().indexOf(question.toLowerCase()) != -1){
                    temp.push(result[i]);
                }
            }
            result = temp;
        }
        
        return result;
    };
});

app.directive('fileModel', ['$parse', function($parse){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                })
            })
        }
    }
}]);

app.service('fileUpload', ['$http', function($http){
    this.post = function(uploadUrl, data){
        var fd = new FormData();
        for(var key in data){
            fd.append(key, data[key]);
        }

        $http({
            method: 'POST',
            url: uploadUrl,
            data: fd,
            transformRequest: angular.idenitity,
            headers: {'Content-Type': undefined}
        }).then(function successCallback(response){

        }, function errorCallback(response){
            console.error("error in posting");
        });
    }
}]);
var app = angular.module('test-creator',['ui.bootstrap']);

app.controller('myController', ['$scope', '$http', '$interval', '$uibModal', 'fileUpload', function($scope, $http, $interval, $uibModal, fileUpload) {
    $scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.angularUser = '';

    $scope.testCategorie = '';
    $scope.questions = [];
    $scope.projects = [];
    $scope.newProject = {project:''};
    $scope.loadingQuestions = true;
    $scope.question = {question:'', duration:20, image: null};
    $scope.selectedQuestion = '';
    $scope.editAnswers = [];
    $scope.answers = {answer1:'', answer1Correct: 1, answer2:'', answer2Correct: 0, answer3:'', answer3Correct: 0, answer4:'', answer4Correct: 0};
    $scope.answerCorrect = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];

    $scope.selectQuestionButtonName = "Select";
    $scope.selectedQuestions = [];

    $scope.filter = {project:''};

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
        if(newValue == 5){
            $scope.clearMessageCounter = 0;
            $interval.cancel(clearMessageTimer);
            $scope.successMessage = '';
            $scope.errorMessage = '';
        }
    });

    $scope.$watch('filter.project', function(newValue, oldValue) {
        if(newValue != oldValue){
            $scope.selectedQuestions = [];
        }
    });

    $scope.setCategory = function(category){
        if($scope.filter.project != ''){
            $scope.loadingQuestions = true;
            $scope.questions = [];
            $scope.testCategorie = category;
            $scope.getQuestions(category);
        }
        else{
            $scope.errorMessage = "Please Select a Project First!";
        }
    }

    $scope.getProjects = function(){
        $http({
            method: 'GET',
            url: '/create-test/getProjects',
        }).then(function successCallback(response){
            $scope.projects = response.data.projects;
            $scope.angularUser = response.data.angularUser;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getProjects();

    $scope.createProject = function(project){
        if(project != '' && project){
            $http({
                method: 'POST',
                url: '/create-test/createProject',
                data: {project: project}
            }).then(function successCallback(response){
                $scope.errorMessage = response.data.errorMessage;
                $scope.successMessage = response.data.successMessage;
                $scope.projects.push({id: response.data.newProject.insertId, project: project});
                $scope.newProject.project = '';
            }, function errorCallback(response){
                console.error("error in posting");
            });
        }
        else{
            $scope.errorMessage = "Project cannot be empty!!";
        }
    }

    $scope.getQuestions = function(category){
        $http({
            method: 'POST',
            url: '/create-test/getQuestions',
            data: {category : category, projectID: $scope.filter.project}
        }).then(function successCallback(response){

            for(var i = 0; i < response.data.questions.length; i++){
                response.data.questions[i].creation_time = prettyDate(response.data.questions[i].creation_time);
            }

            $scope.questions = response.data.questions;
            $scope.selectedQuestions = [];
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
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
                questionData = {category: $scope.testCategorie, answers: $scope.answers, question: $scope.question.question, projectID: $scope.filter.project, duration: $scope.question.duration, image: $scope.question.image.name};
            }
            else{
                questionData = {category: $scope.testCategorie, answers: $scope.answers, question: $scope.question.question, projectID: $scope.filter.project, duration: $scope.question.duration, image: null};
            }

            $http({
                method: 'POST',
                url: '/create-test/addQuestion',
                data: questionData
            }).then(function successCallback(response){
                $scope.errorMessage = response.data.errorMessage;
                $scope.successMessage = response.data.successMessage;
                $scope.answers = {answer1:'', answer1Correct: 1, answer2:'', answer2Correct: 0, answer3:'', answer3Correct: 0, answer4:'', answer4Correct: 0};
                $scope.question.question = '';
                $scope.question.duration = 20;
                $scope.question.image = null;
                $scope.getQuestions($scope.testCategorie);
            }, function errorCallback(response){
                console.error("error in posting");
            });
        }
        else{
            $scope.errorMessage = "Not all required data has been entered to create a new question!!";
        }
    }

    //Choose questions for the new test
    $scope.selectQuestion = function(question){
        if($scope.selectedQuestions.length > 0){
            var alreadySelected = false;
            for(var i = 0; i < $scope.selectedQuestions.length; i++){
                if($scope.selectedQuestions[i].id == question.id){
                    alreadySelected = true;
                }
            }
            if(!alreadySelected){
                $scope.selectedQuestions.push(question);
            }
        }
        else{
            $scope.selectedQuestions.push(question);
        }
    }

    //Remove batches from audit
    $scope.unselectQuestion = function(question){
        if($scope.selectedQuestions.length > 0){
            for(var i = 0; i < $scope.selectedQuestions.length; i++){
                if($scope.selectedQuestions[i] == question){
                    $scope.selectedQuestions.splice(i, 1);
                    break;
                }
            }
        }
    }

    $scope.createTest = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/modals/createTest.html',
            controller: 'CreateTestModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                items: function () {
                    return $scope.selectedQuestions;
                }
            }
        });

        modalInstance.result.then(function (testName) {
            if(testName != ""){
                var data = {testName : testName, questions : $scope.selectedQuestions, project: $scope.filter.project}
                $http({
                    method: 'POST',
                    url: '/create-test/createTest',
                    data: data
                }).then(function successCallback(response){
                    $scope.errorMessage = response.data.errorMessage;
                    $scope.successMessage = response.data.successMessage;
                    $scope.testCategorie = '';
                    $scope.questions = [];
                    $scope.question.question = '';
                    $scope.question.duration = 20;
                    $scope.answers = {answer1:'', answer1Correct: 1, answer2:'', answer2Correct: 0, answer3:'', answer3Correct: 0, answer4:'', answer4Correct: 0};
                }, function errorCallback(response){
                    console.error("error in posting");
                });
            }
            else{
                $scope.errorMessage = "Please give the test a name!";
            }
        }, function () {
        });
    };

    $scope.editQuestion = function (question) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/modals/editQuestion.html',
            controller: 'EditQuestionModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                items: function () {
                    return {question: question, angularUser: $scope.angularUser};
                }
            }
        });

        modalInstance.result.then(function (data) {
            switch(data.action){
                case 'Update':
                    $scope.updateQuestion(data);
                break;

                case 'Deactivate':
                    $scope.deactivateQuestion(data);
                break;

                case 'Activate':
                    $scope.activateQuestion(data);
                break;

                case 'Delete':
                    $scope.deleteQuestion(data);
                break;
            } 
        }, function () {
        });
    };

    $scope.updateQuestion = function(data) {
        if(data.question.duration < 10 || !data.question){
            data.question.duration = 10;
        }

        if(data.updateImage == 1){
            if(data.newImage && data.newImage != ''){
                $scope.uploadPic({image: data.newImage});
                data.question.image = data.newImage.name;
            }
            else{
                data.question.image = null;
            }
        }

        $http({
            method: 'POST',
            url: '/create-test/updateQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions($scope.testCategorie);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deactivateQuestion = function(data) {
        $http({
            method: 'POST',
            url: '/create-test/deactivateQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions($scope.testCategorie);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.activateQuestion = function(data) {
        $http({
            method: 'POST',
            url: '/create-test/activateQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions($scope.testCategorie);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deleteQuestion = function(data) {
        $http({
            method: 'POST',
            url: '/create-test/deleteQuestion',
            data: data
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getQuestions($scope.testCategorie);
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.$watch('filter.project', function(newValue, oldValue) {
        if(newValue != oldValue){
            $scope.loadingQuestions = true;
            $scope.questions = [];
            $scope.getQuestions($scope.testCategorie);
        }
    });

    $scope.$watch('answers.answer1Correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.answers.answer2Correct = 0;
            $scope.answers.answer3Correct = 0;
            $scope.answers.answer4Correct = 0;
        }
    });

    $scope.$watch('answers.answer2Correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.answers.answer1Correct = 0;
            $scope.answers.answer3Correct = 0;
            $scope.answers.answer4Correct = 0;
        }
    });

    $scope.$watch('answers.answer3Correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.answers.answer1Correct = 0;
            $scope.answers.answer2Correct = 0;
            $scope.answers.answer4Correct = 0;
        }
    });

    $scope.$watch('answers.answer4Correct', function(newValue, oldValue) {
        if(newValue == 1){
            $scope.answers.answer1Correct = 0;
            $scope.answers.answer2Correct = 0;
            $scope.answers.answer3Correct = 0;
        }
    });

    $scope.$watchGroup(['answers.answer1Correct', 'answers.answer2Correct', 'answers.answer3Correct', 'answers.answer4Correct'], function(newValues, oldValues) {
        if(newValues[0] == 0 && newValues[1] == 0 && newValues[2] == 0 && newValues[3] == 0){
            $scope.answers.answer1Correct = 1;
        }
    });
}]);

app.controller('CreateTestModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.items = items;
    $ctrl.test = {
        name: ''
    };

    $ctrl.ok = function () {
        $uibModalInstance.close($ctrl.test.name);
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('EditQuestionModalInstanceCtrl', function ($scope, $uibModalInstance, $http, items) {
    var $ctrl = this;
    $ctrl.question = items.question;
    $ctrl.questionAnswers = [];
    $ctrl.answerCorrect = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];
    $ctrl.updateImageOptions = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];
    $ctrl.updateImage = 0;
    $ctrl.angularUser = items.angularUser;
    $ctrl.newImage = '';

    $ctrl.getQuestionAnswers = function(question) {
        $http({
            method: 'POST',
            url: '/create-test/getAnswers',
            data: question
        }).then(function successCallback(response){
            $ctrl.questionAnswers = response.data.answers;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $ctrl.getQuestionAnswers($ctrl.question);

    $scope.$watch('$ctrl.questionAnswers[0].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $ctrl.questionAnswers[1].correct = 0;
            $ctrl.questionAnswers[2].correct = 0;
            $ctrl.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('$ctrl.questionAnswers[1].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $ctrl.questionAnswers[0].correct = 0;
            $ctrl.questionAnswers[2].correct = 0;
            $ctrl.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('$ctrl.questionAnswers[2].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $ctrl.questionAnswers[0].correct = 0;
            $ctrl.questionAnswers[1].correct = 0;
            $ctrl.questionAnswers[3].correct = 0;
        }
    });

    $scope.$watch('$ctrl.questionAnswers[3].correct', function(newValue, oldValue) {
        if(newValue == 1){
            $ctrl.questionAnswers[0].correct = 0;
            $ctrl.questionAnswers[1].correct = 0;
            $ctrl.questionAnswers[2].correct = 0;
        }
    });

    $scope.$watch('$ctrl.newImage', function(newValue, oldValue) {
        if(newValue != ''){
            $ctrl.updateImage = 1;
        }
    });

    $scope.$watchGroup(['$ctrl.questionAnswers[0].correct', '$ctrl.questionAnswers[1].correct', '$ctrl.questionAnswers[2].correct', '$ctrl.questionAnswers[3].correct'], function(newValues, oldValues) {
        if(newValues[0] == 0 && newValues[1] == 0 && newValues[2] == 0 && newValues[3] == 0){
            $ctrl.questionAnswers[0].correct = 1;
        }
    });

    $ctrl.performAction = function (action) {
        var data = {action: action, question: $ctrl.question, answers: $ctrl.questionAnswers, newImage: $ctrl.newImage, updateImage: $ctrl.updateImage}
        $uibModalInstance.close(data);
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
}])

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
}])
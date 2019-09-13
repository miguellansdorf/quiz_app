var app = angular.module('statistics',['720kb.datepicker', 'ui.bootstrap.datetimepicker', 'ui.bootstrap']);

app.controller('myController', function($scope, $http, $uibModal) {
    $scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.angularUserRoleId = '';

    $scope.projects = [];
    $scope.users = [];

    $scope.leaderboard = [];
    $scope.loadingLeaderboard = true;
    $scope.leaderboardToday = [];
    $scope.loadingLeaderboardToday = true;

    $scope.tests = [];

    $scope.testResults = [];
    $scope.loadingResults = true;

    $scope.selectedSession = '';
    $scope.resultAnswers = [];
    $scope.loadingResultAnswers = true;

    $scope.questions = [];
    $scope.loadingQuestions = true;
    $scope.selectedQuestion = '';
    $scope.questionsDetailed = [];
    $scope.loadingQuestionDetails = true;

    $scope.filter = {projectID: "", project: "", date_from : moment().format('YYYY-MM-DD HH:mm:ss'), date_to : moment().format('YYYY-MM-DD HH:mm:ss'), test : "", username : ""};
    
    $scope.filteredResult = [];
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.pages = 0;

    $scope.personalInfoFilter = {firstname:'', lastname:'', username:''};
    $scope.personalInfo = [];
    $scope.loadingPersonalInfo = true;
    $scope.selectedPersonalQuestion = '';
    $scope.personalQuestionInfo = [];
    $scope.loadingPersonalQuestionInfo = true;
    $scope.personalBest = [];
    $scope.loadingPersonalBest = true;

    $scope.numberOfPages = function(resultsCount){
        $scope.pages = Math.ceil(resultsCount/$scope.pageSize);                
    }

    $scope.getProjects = function(){
        $http({
            method: 'GET',
            url: '/statistics/getProjects',
        }).then(function successCallback(response){
            $scope.projects = response.data.projects;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getProjects();

    $scope.getUsers = function(){
        $http({
            method: 'POST',
            url: '/statistics/getUsers',
            data: {projectID: $scope.filter.projectID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.users = response.data.users;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getTests = function(){
        $http({
            method: 'POST',
            url: '/statistics/getTests',
            data: {projectID: $scope.filter.projectID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.tests = response.data.tests;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getLeaderboard = function(){
        $http({
            method: 'POST',
            url: '/statistics/getLeaderboard',
            data: {project: $scope.filter.project}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.leaderboard = response.data.leaderboard;
            $scope.loadingLeaderboard = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getLeaderboardToday = function(today){
        $http({
            method: 'POST',
            url: '/statistics/getLeaderboardToday',
            data: {project: $scope.filter.project, today: today}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.leaderboardToday = response.data.leaderboardToday;
            $scope.loadingLeaderboardToday = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getQuestionsAnsweredIncorrectly = function(){
        $http({
            method: 'POST',
            url: '/statistics/getQuestionsAnsweredIncorrectly',
            data: {projectID: $scope.filter.projectID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.questions = response.data.questions;
            $scope.loadingQuestions = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.selectQuestion = function(question){
        $scope.questionsDetailed = [];
        $scope.loadingQuestionDetails = true;
        $scope.selectedQuestion = question;
        $scope.getQuestionsAnsweredIncorrectlyDetailed(question.id)
    }

    $scope.getQuestionsAnsweredIncorrectlyDetailed = function(questionID){
        $http({
            method: 'POST',
            url: '/statistics/getQuestionsAnsweredIncorrectlyDetailed',
            data: {questionID: questionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.questionsDetailed = response.data.questionsDetailed;
            $scope.loadingQuestionDetails = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getPersonalInfo = function(){
        $http({
            method: 'POST',
            url: '/statistics/getPersonalInfo',
            data: {username: $scope.personalInfoFilter.username, projectID: $scope.filter.projectID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.personalInfo = response.data.personalInfo;
            $scope.loadingPersonalInfo = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getPersonalQuestionInfo = function(questionID, question){
        $scope.loadingPersonalQuestionInfo = true;
        $scope.selectedPersonalQuestion = question;
        $http({
            method: 'POST',
            url: '/statistics/getPersonalQuestionInfo',
            data: {username: $scope.personalInfoFilter.username, questionID: questionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.personalQuestionInfo = response.data.personalQuestionInfo;
            $scope.loadingPersonalQuestionInfo = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getPersonalBest = function(){
        $http({
            method: 'POST',
            url: '/statistics/getPersonalBest',
            data: {username: $scope.personalInfoFilter.username, project: $scope.filter.project}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;

            for(var i = 0; i < response.data.personalBest.length; i++){
                response.data.personalBest[i].start = prettyDate(response.data.personalBest[i].start);
                response.data.personalBest[i].finish = prettyDate(response.data.personalBest[i].finish);
            }

            $scope.personalBest = response.data.personalBest;
            $scope.loadingPersonalBest = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.getResults = function(){
        $http({
            method: 'POST',
            url: '/statistics/getResults',
            data: {project: $scope.filter.project}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            for(var i = 0; i < response.data.testResults.length; i++){
                response.data.testResults[i].start = prettyDate(response.data.testResults[i].start);
                response.data.testResults[i].finish = prettyDate(response.data.testResults[i].finish);
            }
            
            if(response.data.testResults.length > 0){
                $scope.filter.date_from = response.data.testResults[response.data.testResults.length - 1].start;
                $scope.testResults = response.data.testResults;
            }
            $scope.loadingResults = false;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.clearQuestion = function(){
        $scope.selectedQuestion = '';
        $scope.questionsDetailed = [];
        $scope.loadingQuestionDetails = true;
    }

    $scope.selectSession = function(session){
        $scope.resultAnswers = [];
        $scope.loadingResultAnswers = true;
        $scope.selectedSession = session;
        $scope.getResultAnswers(session.id);
    }

    $scope.getResultAnswers = function(sessionID){
        $http({
            method: 'POST',
            url: '/statistics/getResultAnswers',
            data: {sessionID : sessionID}
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.resultAnswers = response.data.resultAnswers;
            $scope.loadingResultAnswers = false;

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/modals/sessionStats.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                windowClass: 'app-modal-window',
                resolve: {
                    items: function () {
                        return {session: $scope.selectedSession, resultAnswers: $scope.resultAnswers};
                    }
                }
            });

            modalInstance.result.then(function (testName) {
                $scope.selectedSession = '';
                $scope.resultAnswers = [];
                $scope.loadingResultAnswers = true;
            }, function () {
                $scope.selectedSession = '';
                $scope.resultAnswers = [];
                $scope.loadingResultAnswers = true;
            });

        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.clearSession = function(){
        $scope.selectedSession = '';
        $scope.resultAnswers = [];
        $scope.loadingResultAnswers = true;
    }

    $scope.$watch('filter.projectID', function(newValue, oldValue) {
        if(newValue != oldValue){
            for(var i = 0; i < $scope.projects.length; i++){
                if($scope.projects[i].id == newValue){
                    $scope.filter.project = $scope.projects[i].project;
                }
            }
            $scope.personalInfoFilter = {firstname:'', lastname:'', username:''};
            $scope.users = [];
            $scope.getUsers();

            $scope.leaderboard = [];
            $scope.loadingLeaderboard = true;
            $scope.getLeaderboard();

            $scope.leaderboardToday = [];
            $scope.loadingLeaderboardToday = true;
            $scope.getLeaderboardToday(moment().format('YYYY-MM-DD'));

            $scope.filter.test = "";
            $scope.tests = [];
            $scope.getTests();

            $scope.questions = [];
            $scope.loadingQuestions = true;
            $scope.getQuestionsAnsweredIncorrectly();

            $scope.testResults = [];
            $scope.loadingResults = true;
            $scope.getResults();
        }
    });

    $scope.$watch('personalInfoFilter.username', function(newValue, oldValue) {
        if(newValue != oldValue && newValue != ''){
            for(var i = 0; i < $scope.users.length; i++){
                if($scope.users[i].username == newValue){
                    $scope.personalInfoFilter.firstname = $scope.users[i].firstname;
                    $scope.personalInfoFilter.lastname = $scope.users[i].lastname;
                }
            }
            $scope.selectedPersonalQuestion = '';
            $scope.personalQuestionInfo = [];
            $scope.loadingPersonalQuestionInfo = true;
            $scope.loadingPersonalInfo = true;
            $scope.getPersonalInfo();
            $scope.getPersonalBest();
        }
        if(newValue == ''){
            $scope.selectedPersonalQuestion = '';
            $scope.personalQuestionInfo = [];
            $scope.loadingPersonalQuestionInfo = true;
            $scope.personalInfoFilter.firstname = '';
            $scope.personalInfoFilter.lastname = '';
            $scope.loadingPersonalInfo = true;
            $scope.personalInfo = [];
            $scope.personalBest = [];
            $scope.loadingPersonalBest = true;
        }
    });
});

app.filter("resultsfilter", function() {
    return function(items, dateFrom, dateTo, test, username, start, scope) {
        start = +start;
        dateFrom = prettyDate(dateFrom);
        dateTo = prettyDate(dateTo);

        var result = [];
        for (var i=0; i<items.length; i++){
            if (items[i].start >= dateFrom && items[i].finish <= dateTo)  {
                result.push(items[i]);
            }
        }

        if(test != ""){
            var temp = [];
            for(var i=0; i<result.length; i++){
                if(result[i].test == test){
                    temp.push(result[i]);
                }
            }
            result = temp;
        }

        if(username != ""){
            var temp = [];
            for(var i=0; i<result.length; i++){
                if(result[i].username == username){
                    temp.push(result[i]);
                }
            }
            result = temp;
        }
        
        scope.filteredResult = result;
        scope.numberOfPages(scope.filteredResult.length);

        if((scope.currentPage + 1) > scope.pages && scope.pages > 0){
            scope.currentPage = scope.pages - 1;
        }
        return result.slice(start);
    };
});

app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.items = items;

    $ctrl.ok = function () {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
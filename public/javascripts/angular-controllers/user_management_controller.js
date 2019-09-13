var app = angular.module('user-management',[]);

app.controller('myController', function($scope, $http) {
    $scope.orderByField = 'username';
    $scope.reverseSort = true;
    $scope.users = [];
    $scope.roles = [];
    $scope.activeOptions = [{id: 0, value:"NO"}, {id: 1, value:"YES"}];
    $scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.editMode = false;
    $scope.createNewUser = false;
    $scope.buttonName = 'Edit';
    $scope.userToDelete = '';

    $scope.newUser = {username:"", firstname:"", lastname:"", email:"",  role_id:1, password:"", password_repeat:""};
    
    $scope.getUserInfoForDeletion = function(user, index) {
        $scope.userToDelete = user;
    }
    
    //Get function
    $scope.getData = function() {
        $http({
            method: 'GET',
            url: '/users/data'
        }).then(function successCallback(response){
            $scope.users = response.data.users;
            $scope.roles = response.data.roles;
        }, function errorCallback(response){
            console.error("error in getting data");
        });
    }

    $scope.getData();

    //Post function
    $scope.updateUser = function(user, index) {
        $http({
            method: 'POST',
            url: '/users/updateUser',
            data: user
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.createUser = function() {
        $http({
            method: 'POST',
            url: '/users/createUser',
            data: $scope.newUser
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getData();
            if(response.data.successMessage)
            {
                $scope.newUser = {user_name:"", full_name:"", role_id:1, password:"", password_repeat:""};
            }
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }

    $scope.deleteUser = function(user, index) {
        $http({
            method: 'POST',
            url: '/users/deleteUser',
            data: user
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;
            $scope.getData();
        }, function errorCallback(response){
            console.error("error in posting");
        });
    }
});
var app = angular.module('change-password',[]);

app.controller('myController', function($scope, $http) {
    $scope.errorMessage = '';
    $scope.successMessage = '';

    //Post function
    $scope.changePassword = function() {
        $http({
            method: 'POST',
            url: '/change-password',
            data: $scope.user
        }).then(function successCallback(response){
            $scope.errorMessage = response.data.errorMessage;
            $scope.successMessage = response.data.successMessage;

            $scope.user = {currentPassword : '', newPassword : '', repeatNewPassword : ''};
        }, function errorCallback(response){
            console.error("error in posting");

            $scope.user = {currentPassword : '', newPassword : '', repeatNewPassword : ''};
        });
    }
});
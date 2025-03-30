// app.js
angular.module('imdbApp', [])
  .controller('AuthController', ['$scope', '$http', function($scope, $http) {
    
    $scope.loginData = {};
    $scope.signupData = {};
    $scope.loggedIn = false;
    $scope.currentUser = {};
    $scope.message = '';

    $scope.login = function() {
      $http.post('/api/auth/login', $scope.loginData)
        .then(function(response) {
          $scope.loggedIn = true;
          $scope.currentUser = { username: $scope.loginData.username };
          $scope.message = response.data.message;
        }, function(error) {
          $scope.message = error.data.message || 'Login failed';
        });
    };

    $scope.signup = function() {
      $http.post('/api/auth/signup', $scope.signupData)
        .then(function(response) {
          $scope.loggedIn = true;
          $scope.currentUser = { username: $scope.signupData.username };
          $scope.message = response.data.message;
        }, function(error) {
          $scope.message = error.data.message || 'Signup failed';
        });
    };

    // Logout function
    $scope.logout = function() {
      $http.post('/api/auth/logout')
        .then(function(response) {
          $scope.loggedIn = false;
          $scope.currentUser = {};
          $scope.message = response.data.message;
        }, function(error) {
          $scope.message = error.data.message || 'Logout failed';
        });
    };
  }]);

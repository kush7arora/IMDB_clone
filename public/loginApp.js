// loginApp.js
angular.module('imdbApp', [])
  .controller('LoginController', ['$scope', '$http', function($scope, $http) {
    $scope.loginData = {};
    $scope.errorMessage = '';

    $scope.login = function() {
      $http.post('/api/auth/login', $scope.loginData)
        .then(function(response) { 
          window.location.href = "/movies";
        }, function(error) {
          $scope.errorMessage = error.data.message || 'Login failed';
        });
    };
  }]);

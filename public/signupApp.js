// signupApp.js
angular.module('imdbApp', [])
  .controller('SignupController', ['$scope', '$http', function($scope, $http) {
    $scope.signupData = {};
    $scope.errorMessage = '';

    $scope.signup = function() {
      $http.post('/api/auth/signup', $scope.signupData, { withCredentials: true })
        .then(function(response) {
          
          window.location.href = "/movies";
        }, function(error) {
          $scope.errorMessage = error.data.message || 'Signup failed';
        });
    };
  }]);

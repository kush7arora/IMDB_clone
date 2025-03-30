// signupApp.js
angular.module('imdbApp', [])
  .controller('SignupController', ['$scope', '$http', function($scope, $http) {
    $scope.signupData = {};
    $scope.errorMessage = '';

    $scope.signup = function() {
      $http.post('/api/auth/signup', $scope.signupData)
        .then(function(response) {
          // Redirect to movies page on successful signup (or to login page, as needed)
          window.location.href = "/movies";
        }, function(error) {
          $scope.errorMessage = error.data.message || 'Signup failed';
        });
    };
  }]);

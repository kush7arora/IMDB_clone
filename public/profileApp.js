var app = angular.module('profileApp', ['ngCookies']);

app.controller('ProfileController', function($scope, $http, $cookies, $window) {
  
  var userCookie = $cookies.get('user');
  if (!userCookie) {
    $window.location.href = '/signup';
    return;
  }

  try {
    
    $scope.currentUser = JSON.parse(userCookie);
    
    
    if (!$scope.currentUser || !$scope.currentUser.username) {
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    $cookies.remove('user');
    $window.location.href = '/signup';
    return;
  }

  
  $scope.logout = function() {
    $http.post('/api/auth/logout')
      .then(function(response) {
        $cookies.remove('user');
        $window.location.href = '/signup';
      })
      .catch(function(error) {
        console.error('Logout error:', error);
        $scope.errorMessage = 'Error logging out. Please try again.';
      });
  };
}); 
var app = angular.module('profileApp', ['ngCookies']);

app.controller('ProfileController', function($scope, $http, $cookies, $window) {
  // Check if user is logged in
  var userCookie = $cookies.get('user');
  if (!userCookie) {
    $window.location.href = '/signup';
    return;
  }

  try {
    // Parse user data from cookie
    $scope.currentUser = JSON.parse(userCookie);
    
    // Verify user data is valid
    if (!$scope.currentUser || !$scope.currentUser.username) {
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    $cookies.remove('user');
    $window.location.href = '/signup';
    return;
  }

  // Logout function
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
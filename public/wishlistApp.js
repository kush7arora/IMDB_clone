angular.module('wishlistApp', ['ngCookies'])
  .controller('WishlistController', ['$scope', '$http', '$cookies', '$window', function($scope, $http, $cookies, $window) {
    $scope.wishlist = [];
    $scope.errorMessage = '';

    // Get current user from cookie
    $scope.currentUser = {
      username: $cookies.get('username')
    };

    // Redirect to login if no username cookie exists
    if (!$scope.currentUser.username) {
      $window.location.href = '/signup';
      return;
    }

    // Logout function
    $scope.logout = function() {
      $http.post('/api/auth/logout', {}, { withCredentials: true })
        .then(function(response) {
          // Clear all cookies
          $cookies.remove('username', { path: '/' });
          $cookies.remove('connect.sid', { path: '/' });
          
          // Redirect to signup page
          $window.location.href = '/signup';
        })
        .catch(function(error) {
          console.error('Logout error:', error);
          // Even if the server request fails, clear cookies and redirect
          $cookies.remove('username', { path: '/' });
          $cookies.remove('connect.sid', { path: '/' });
          $window.location.href = '/signup';
        });
    };

    // This call should return a wishlist array containing OMDb-style movie objects.
    $http.get('/api/wishlist')
      .then(function(response) {
        $scope.wishlist = response.data.wishlist;
      })
      .catch(function(error) {
        console.error('Error fetching wishlist:', error);
        $scope.errorMessage = 'Failed to load wishlist. Please try again later.';
      });
  }]);

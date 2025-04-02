angular.module('wishlistApp', ['ngCookies'])
  .controller('WishlistController', ['$scope', '$http', '$cookies', '$window', function($scope, $http, $cookies, $window) {
    $scope.wishlist = [];
    $scope.errorMessage = '';

    // Check if user is logged in
    if (!$cookies.get('user')) {
      $window.location.href = '/signup';
      return;
    }

    // Get user data from cookie with error handling
    try {
      const userData = JSON.parse($cookies.get('user'));
      if (!userData || !userData.username) {
        throw new Error('Invalid user data');
      }
      $scope.currentUser = userData.username;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      $cookies.remove('user');
      $window.location.href = '/signup';
      return;
    }

    // Navigation functions
    $scope.goToMovies = function() {
      $window.location.href = '/movies';
    };

    // View movie details function
    $scope.viewDetails = function(movieId) {
      $window.location.href = '/movie-details?id=' + movieId;
    };

    // Mark movie as watched (removes from wishlist)
    $scope.markAsWatched = function(movieId) {
      $http.delete(`/api/wishlist/remove/${movieId}`)
        .then(function(response) {
          // Remove the movie from the local wishlist array
          $scope.wishlist = $scope.wishlist.filter(movie => movie.movieId !== movieId);
          
          // Show success message
          alert('Movie marked as watched and removed from wishlist!');
        })
        .catch(function(error) {
          console.error('Error marking movie as watched:', error);
          $scope.errorMessage = 'Failed to mark movie as watched. Please try again.';
        });
    };

    // Logout function
    $scope.logout = function() {
      $cookies.remove('user');
      $window.location.href = '/signup';
    };

    // Load wishlist
    $http.get('/api/wishlist')
      .then(function(response) {
        if (response.data && response.data.wishlist) {
          $scope.wishlist = response.data.wishlist;
        } else {
          $scope.wishlist = [];
          $scope.errorMessage = 'No movies in your wishlist.';
        }
      })
      .catch(function(error) {
        console.error('Error loading wishlist:', error);
        $scope.errorMessage = 'Error loading wishlist. Please try again.';
      });
  }]);

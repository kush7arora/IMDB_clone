angular.module('wishlistApp', ['ngCookies'])
  .controller('WishlistController', ['$scope', '$http', '$cookies', '$window', function($scope, $http, $cookies, $window) {
    $scope.wishlist = [];
    $scope.errorMessage = '';
    
    console.log('Initializing WishlistController');
    
    
    console.log('Cookie exists:', !!$cookies.get('user'));
    
    if (!$cookies.get('user')) {
      console.log('No user cookie found, redirecting to signup');
      $window.location.href = '/signup';
      return;
    }

    
    try {
      const userData = JSON.parse($cookies.get('user'));
      console.log('User data from cookie:', userData);
      
      if (!userData || !userData.username) {
        console.error('Invalid user data - missing username');
        throw new Error('Invalid user data');
      }
      $scope.currentUser = userData.username;
      console.log('Current user set to:', $scope.currentUser);
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      $cookies.remove('user');
      $window.location.href = '/signup';
      return;
    }

    
    $scope.goToMovies = function() {
      $window.location.href = '/movies';
    };

    
    $scope.testCookie = function() {
      $scope.debugInfo = {
        cookieExists: !!$cookies.get('user'),
        allCookies: $cookies.getAll(),
        parsedCookie: null,
        error: null
      };
      
      try {
        if ($cookies.get('user')) {
          $scope.debugInfo.parsedCookie = JSON.parse($cookies.get('user'));
        }
      } catch (error) {
        $scope.debugInfo.error = error.message;
      }
      
      
      $http.get('/api/wishlist/test-auth', { withCredentials: true })
        .then(response => {
          $scope.debugInfo.apiResponse = response.data;
        })
        .catch(error => {
          $scope.debugInfo.apiError = error.data || error.message;
        });
    };

    
    $scope.viewDetails = function(movieId) {
      $window.location.href = '/movie-details?id=' + movieId;
    };

    
    $scope.markAsWatched = function(movieId) {
      console.log('Marking movie as watched, movieId:', movieId);
      
      if (!movieId) {
        console.error('Invalid movie ID provided to markAsWatched');
        $scope.errorMessage = 'Invalid movie ID';
        return;
      }
      
      
      console.log('Sending POST request to /api/wishlist/remove with movieId:', movieId);
      
      $http({
        method: 'POST',
        url: '/api/wishlist/remove',
        data: { movieId: movieId },
        withCredentials: true,  
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          console.log('Successfully removed movie from wishlist:', response.data);
          // Remove the movie from the local wishlist array
          $scope.wishlist = $scope.wishlist.filter(movie => movie.movieId !== movieId);
          console.log('Updated wishlist length:', $scope.wishlist.length);
          
          // Show success message
          alert('Movie marked as watched and removed from wishlist!');
        })
        .catch(function(error) {
          console.error('Error marking movie as watched:', error);
          console.error('Error details:', error.data);
          $scope.errorMessage = 'Failed to mark movie as watched. Please try again.';
        });
    };

    // Logout function
    $scope.logout = function() {
      $cookies.remove('user');
      $window.location.href = '/signup';
    };

    // Load wishlist
    console.log('Loading wishlist from server');
    $http({
      method: 'GET',
      url: '/api/wishlist',
      withCredentials: true,
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(function(response) {
        console.log('Wishlist response:', response.data);
        if (response.data && response.data.wishlist) {
          $scope.wishlist = response.data.wishlist;
          console.log('Loaded wishlist with', $scope.wishlist.length, 'items');
        } else {
          $scope.wishlist = [];
          console.log('No items in wishlist or invalid response');
          $scope.errorMessage = 'No movies in your wishlist.';
        }
      })
      .catch(function(error) {
        console.error('Error loading wishlist:', error);
        $scope.errorMessage = 'Error loading wishlist. Please try again.';
      });
  }]);

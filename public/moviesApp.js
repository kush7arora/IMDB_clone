angular.module('imdbApp', ['ngCookies'])
  .controller('MoviesController', ['$scope', '$http', '$cookies', '$window', function($scope, $http, $cookies, $window) {
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

    // Initialize movies array
    $scope.movies = [];
    $scope.randomMovie = null;
    $scope.randomMovieDetails = null;
    $scope.errorMessage = '';
    $scope.searchTerm = '';  // Model for the search input

    // Function to select a random movie for featured section
    function selectRandomMovie() {
      if ($scope.movies && $scope.movies.length > 0) {
        const randomIndex = Math.floor(Math.random() * $scope.movies.length);
        $scope.randomMovie = $scope.movies[randomIndex];
        
        // Fetch detailed information for the random movie
        $http.get(`/api/proxy/movie?id=${$scope.randomMovie.imdbID}`, { withCredentials: true })
          .then(function(response) {
            if (response.data.Response === "True") {
              $scope.randomMovieDetails = response.data;
            }
          })
          .catch(function(error) {
            console.error('Error fetching movie details:', error);
          });
      }
    }

    // Navigation functions
    $scope.goToWishlist = function() {
      $window.location.href = '/wishlist';
    };

    $scope.goToMovies = function() {
      $window.location.href = '/movies';
    };
    
    $scope.goToRandomMovie = function() {
      $window.location.href = '/randomMovie';
    };

    // Function to search movies
    $scope.searchMovies = function() {
      if ($scope.searchTerm.trim() === '') {
        $scope.loadDefaultMovies();
        return;
      }

      $http.get(`/api/proxy/movies?query=${encodeURIComponent($scope.searchTerm)}`, { withCredentials: true })
        .then(function(response) {
          if (response.data.Response === "True") {
            $scope.movies = response.data.Search;
            selectRandomMovie(); // Select a random movie after search
          } else {
            $scope.movies = [];
            $scope.randomMovie = null;
            $scope.randomMovieDetails = null;
            $scope.errorMessage = response.data.Error || 'No movies found.';
          }
        })
        .catch(function(error) {
          console.error('Error searching movies:', error);
          $scope.errorMessage = 'Error searching movies. Please try again.';
        });
    };

    // Function to add movie to wishlist
    $scope.addToWishlist = function(movie) {
      $http.post('/api/wishlist/add', {
        movieId: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster
      }, { withCredentials: true })
      .then(function(response) {
        alert('Movie added to wishlist!');
      })
      .catch(function(error) {
        console.error('Error adding to wishlist:', error);
        $scope.errorMessage = 'Failed to add movie to wishlist';
      });
    };

    // Function to view movie details
    $scope.viewDetails = function(movieId) {
      $window.location.href = '/movie-details?id=' + movieId;
    };

    // Logout function
    $scope.logout = function() {
      $cookies.remove('user');
      $window.location.href = '/signup';
    };

    // Load default movies on page load
    $scope.loadDefaultMovies = function() {
      $http.get(`/api/proxy/movies?query=star`, { withCredentials: true })
        .then(function(response) {
          if (response.data.Response === "True") {
            $scope.movies = response.data.Search;
            selectRandomMovie(); // Select a random movie on initial load
          } else {
            $scope.movies = [];
            $scope.randomMovie = null;
            $scope.randomMovieDetails = null;
            $scope.errorMessage = 'Error loading movies.';
          }
        })
        .catch(function(error) {
          console.error('Error loading default movies:', error);
          $scope.errorMessage = 'Error loading movies. Please try again.';
        });
    };

    // Load default movies when the page loads
    $scope.loadDefaultMovies();
  }]);

angular.module('movieDetailsApp', ['ngCookies'])
  .controller('MovieDetailsController', ['$scope', '$http', '$cookies', function($scope, $http, $cookies) {
    $scope.movie = null;
    $scope.errorMessage = '';
    $scope.comments = [];
    $scope.averageRating = 0;
    $scope.ratingsCount = 0;

    // Ensure the cookie is set with a default username if none exists
    if (!$cookies.get('username')) {
      $cookies.put('username', 'Anonymous', { path: '/' });
    }

    // Retrieve username from cookie and set it for new comments
    $scope.newComment = {
      text: '',
      rating: null,
      username: $cookies.get('username')
    };

    console.log("Retrieved username from cookie:", $scope.newComment.username);

    // Extract movie id (IMDb ID) from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) {
      $scope.errorMessage = 'No movie ID provided.';
      return;
    }

    // Use the OMDb API to fetch movie details
    const apiKey = '228b48c4'; // Replace with your OMDb API key
    const movieUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`;

    // Fetch movie details from OMDb
    $http.get(movieUrl)
      .then(function(response) {
        if (response.data.Response === "True") {
          $scope.movie = response.data;
        } else {
          $scope.errorMessage = response.data.Error || 'Movie not found.';
        }
      })
      .catch(function(error) {
        console.error('Error fetching movie details:', error);
        $scope.errorMessage = 'Failed to load movie details. Please try again later.';
      });

    // Function to add movie to wishlist
    $scope.addToWishlist = function() {
      $http.post('/api/wishlist/add', $scope.movie)
        .then(function(response) {
          alert('Movie added to wishlist!');
        })
        .catch(function(error) {
          console.error('Error adding movie to wishlist:', error);
          alert('Failed to add movie to wishlist.');
        });
    };

    // Load existing comments, ratings, and average rating for this movie from your backend
    function loadComments() {
      $http.get('/api/movies/' + movieId + '/comments')
        .then(function(response) {
          $scope.comments = response.data.comments;
          $scope.averageRating = response.data.averageRating;
          $scope.ratingsCount = response.data.ratingsCount;
        })
        .catch(function(error) {
          console.error('Error fetching comments:', error);
          $scope.errorMessage = 'Failed to load comments.';
        });
    }
    loadComments();

    // Set rating when a rating button is clicked
    $scope.selectRating = function(rating) {
      $scope.newComment.rating = rating;
    };

    // Submit a new comment and rating to your backend
    $scope.submitComment = function() {
      if (!$scope.newComment.text || !$scope.newComment.rating) {
        alert('Please enter a comment and select a rating.');
        return;
      }
      
      const payload = {
        movieId: movieId,
        username: $scope.newComment.username,
        text: $scope.newComment.text,
        rating: $scope.newComment.rating
      };

      $http.post('/api/movies/' + movieId + '/comments', payload)
        .then(function(response) {
          // Clear form and reload comments and ratings
          $scope.newComment.text = '';
          $scope.newComment.rating = null;
          loadComments();
        })
        .catch(function(error) {
          console.error('Error posting comment:', error);
          $scope.errorMessage = 'Failed to post comment. Please try again.';
        });
    };

  }]);

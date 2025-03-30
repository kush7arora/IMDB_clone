angular.module('imdbApp', [])
  .controller('MoviesController', ['$scope', '$http', function($scope, $http) {
    $scope.movies = [];
    $scope.errorMessage = '';
    $scope.searchTerm = '';  // Model for the search input

    const apiKey = '228b48c4'; // Replace with your OMDb API key
    const defaultSearch = 'Avengers';  // Default search query if no search term is provided
    const searchUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=`;

    // Function to load default movies (simulate "popular" movies)
    $scope.loadDefaultMovies = function() {
      $http.get(searchUrl + encodeURIComponent(defaultSearch))
        .then(function(response) {
          if (response.data && response.data.Search) {
            $scope.movies = response.data.Search;
            $scope.errorMessage = '';
          } else {
            $scope.movies = [];
            $scope.errorMessage = 'No movies found.';
          }
        })
        .catch(function(error) {
          console.error('Error fetching movies:', error);
          $scope.errorMessage = 'Failed to load movies. Please try again later.';
        });
    };

    // Function to search movies based on searchTerm
    $scope.searchMovies = function() {
      if (!$scope.searchTerm || $scope.searchTerm.trim() === '') {
        $scope.loadDefaultMovies();
        return;
      }
      $http.get(searchUrl + encodeURIComponent($scope.searchTerm))
        .then(function(response) {
          if (response.data && response.data.Search) {
            $scope.movies = response.data.Search;
            $scope.errorMessage = '';
          } else {
            $scope.movies = [];
            $scope.errorMessage = 'No movies found for that search term.';
          }
        })
        .catch(function(error) {
          console.error('Error searching movies:', error);
          $scope.errorMessage = 'Failed to search movies. Please try again later.';
        });
    };

    // Watch for changes in searchTerm and trigger search
    $scope.$watch('searchTerm', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.searchMovies();
      }
    });

    // Initially load default movies
    $scope.loadDefaultMovies();
  }]);

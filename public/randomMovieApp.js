var app = angular.module('randomMovieApp', ['ngCookies']);

app.controller('RandomMovieController', function($scope, $http, $cookies, $window) {
    // Initialize user status
    $scope.currentUser = 'Guest';
    
    // Check if user is logged in
    if (!$cookies.get('user')) {
        $window.location.href = '/signup';
        return;
    }

    // Get user data from cookie
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

    // Initialize random movie and status
    $scope.randomMovie = null;
    $scope.errorMessage = '';
    $scope.isLoading = false;
    
    // Initialize search criteria with default values
    $scope.searchCriteria = {
        minDuration: 90,
        maxDuration: 180,
        minRating: 7.0,
        startYear: 1990,
        endYear: 2022
    };
    
    // Default genre selection
    $scope.selectedGenre = 'Action';
    
    // Function to find a random movie from the selected genre
    $scope.findRandomMovie = function() {
        // Basic form validation
        if ($scope.searchCriteria.startYear > $scope.searchCriteria.endYear) {
            $scope.errorMessage = 'Start year cannot be greater than end year';
            return;
        }

        if ($scope.searchCriteria.minDuration > $scope.searchCriteria.maxDuration) {
            $scope.errorMessage = 'Minimum duration cannot be greater than maximum duration';
            return;
        }
        
        $scope.errorMessage = '';
        $scope.randomMovie = null;
        $scope.isLoading = true;
        
        console.log('Finding random movie with criteria:', {
            genre: $scope.selectedGenre,
            minDuration: $scope.searchCriteria.minDuration,
            maxDuration: $scope.searchCriteria.maxDuration,
            minRating: $scope.searchCriteria.minRating,
            startYear: $scope.searchCriteria.startYear,
            endYear: $scope.searchCriteria.endYear
        });
        
        // Use TMDb discover endpoint to find movies matching ALL criteria
        $http.get('/api/tmdb/discover', {
            params: {
                genre: $scope.selectedGenre,
                minDuration: $scope.searchCriteria.minDuration,
                maxDuration: $scope.searchCriteria.maxDuration,
                minRating: $scope.searchCriteria.minRating,
                startYear: $scope.searchCriteria.startYear,
                endYear: $scope.searchCriteria.endYear,
                page: Math.floor(Math.random() * 5) + 1 // Get a random page from first 5 pages
            }
        })
        .then(function(response) {
            console.log('TMDb search response:', response.data);
            
            if (response.data.results && response.data.results.length > 0) {
                // Randomly select a movie from results
                const results = response.data.results;
                const randomIndex = Math.floor(Math.random() * results.length);
                const selectedMovie = results[randomIndex];
                
                console.log('Selected movie:', selectedMovie);
                
                // In case detailed API call fails, set basic movie info immediately
                $scope.randomMovie = {
                    Title: selectedMovie.title,
                    Year: selectedMovie.release_date ? selectedMovie.release_date.substring(0, 4) : 'Unknown',
                    imdbID: selectedMovie.id.toString(),
                    Poster: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : 'N/A',
                    Plot: selectedMovie.overview || 'No plot available',
                    Genre: $scope.selectedGenre,
                    Runtime: selectedMovie.runtime ? `${selectedMovie.runtime} min` : 'Unknown',
                    imdbRating: selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : 'N/A',
                    Director: 'Fetching details...'
                };
                
                // Get detailed information for the selected movie
                $http.get(`/api/tmdb/movie?id=${selectedMovie.id}`)
                    .then(function(detailResponse) {
                        console.log('Movie details response:', detailResponse.data);
                        const movie = detailResponse.data;
                        
                        if (!movie) {
                            console.error('Movie details API returned no data');
                            return;
                        }
                        
                        // Format director name
                        let director = 'Unknown';
                        if (movie.credits && movie.credits.crew) {
                            const directors = movie.credits.crew.filter(person => person.job === 'Director');
                            if (directors.length > 0) {
                                director = directors[0].name;
                            }
                        }
                        
                        // Update the movie data with detailed information
                        $scope.randomMovie = {
                            Title: movie.title,
                            Year: movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown',
                            imdbID: movie.imdb_id || movie.id.toString(),
                            Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
                            Plot: movie.overview || 'No plot available',
                            Genre: movie.genres ? movie.genres.map(g => g.name).join(', ') : $scope.selectedGenre,
                            Runtime: movie.runtime ? `${movie.runtime} min` : 'Unknown',
                            imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
                            Director: director
                        };
                        
                        // Force Angular to update the view
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    })
                    .catch(function(error) {
                        console.error('Error fetching movie details:', error);
                        // We already set basic movie info above, so no need to do anything here
                    })
                    .finally(function() {
                        $scope.isLoading = false;
                        
                        // Ensure Angular UI updates
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                
            } else {
                $scope.errorMessage = 'No movies found matching your criteria. Try broadening your search.';
                $scope.isLoading = false;
                
                // Ensure Angular UI updates
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        })
        .catch(function(error) {
            console.error('Error searching for movies:', error);
            $scope.errorMessage = 'Error searching for movies. Please try again.';
            $scope.isLoading = false;
            
            // Ensure Angular UI updates
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };
    
    // Function to add movie to wishlist
    $scope.addToWishlist = function() {
        if (!$scope.randomMovie) return;

        // Get the movie ID from the movie data
        const movieId = $scope.randomMovie.imdbID;
        const title = $scope.randomMovie.Title;
        const year = $scope.randomMovie.Year;
        const poster = $scope.randomMovie.Poster;

        if (!movieId) {
            $scope.errorMessage = 'Cannot add movie to wishlist: Missing movie ID';
            return;
        }

        $http.post('/api/wishlist/add', {
            movieId: movieId,
            title: title,
            year: year,
            poster: poster
        })
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
        if (!$scope.randomMovie) {
            alert('No movie information available');
            return;
        }
        
        // Check if we have a valid IMDb ID (should start with 'tt')
        if ($scope.randomMovie.imdbID && $scope.randomMovie.imdbID.startsWith('tt')) {
            // If we have a valid IMDb ID, use that
            $window.location.href = `/movie-details?id=${$scope.randomMovie.imdbID}`;
        } else {
            // Otherwise, pass the title and year
            const title = encodeURIComponent($scope.randomMovie.Title);
            const year = $scope.randomMovie.Year || '';
            $window.location.href = `/movie-details?title=${title}&year=${year}`;
        }
    };

    // Navigation functions
    $scope.goToMovies = function() {
        $window.location.href = '/movies';
    };
    
    $scope.goToWishlist = function() {
        $window.location.href = '/wishlist';
    };

    // Function to logout
    $scope.logout = function() {
        $cookies.remove('user');
        $window.location.href = '/signup';
    };
}); 
var app = angular.module('movieDetailsApp', ['ngCookies']);

app.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

app.controller('MovieDetailsController', function($scope, $http, $cookies, $window) {
    
    if (!$cookies.get('user')) {
        $window.location.href = '/signup';
        return;
    }

    
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
    
    
    $scope.newComment = { text: '', rating: null };
    $scope.trailerUrl = null;
    $scope.trailerLoading = false;

    
    $scope.goToMovies = function() {
        $window.location.href = '/movies';
    };

    $scope.goToWishlist = function() {
        $window.location.href = '/wishlist';
    };

    
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const movieTitle = urlParams.get('title');
    const movieYear = urlParams.get('year');

    if (!movieId && !movieTitle) {
        $scope.errorMessage = 'No movie ID or title provided';
        return;
    }

    
    if (movieId) {
        // Fetch by ID
        $http.get(`/api/omdb/movie/${movieId}`)
            .then(function(response) {
                if (response.data.Response === "False") {
                    throw new Error(response.data.Error || "Movie not found");
                }
                $scope.movie = response.data;
                loadComments();
                findMovieTrailer($scope.movie.Title, $scope.movie.Year);
            })
            .catch(function(error) {
                $scope.errorMessage = 'Error loading movie details: ' + (error.message || error);
                console.error('Error:', error);
            });
    } else {
        
        let url = `/api/omdb/movie?title=${encodeURIComponent(movieTitle)}`;
        if (movieYear) {
            url += `&year=${movieYear}`;
        }
        
        $http.get(url)
            .then(function(response) {
                if (response.data.Response === "False") {
                    throw new Error(response.data.Error || "Movie not found");
                }
                $scope.movie = response.data;
                loadComments();
                findMovieTrailer($scope.movie.Title, $scope.movie.Year);
            })
            .catch(function(error) {
                $scope.errorMessage = 'Error loading movie details: ' + (error.message || error);
                console.error('Error:', error);
            });
    }
        
    
    function findMovieTrailer(title, year) {
        $scope.trailerLoading = true;
        

        const knownTrailers = {
            
            'the shawshank redemption': 'PLl99DlL6b4',
            'the godfather': '6hOHvyw6Qia',
            'the dark knight': 'EXeTwQWrcwY',
            'pulp fiction': 's7EdQ4FqbhY',
            'schindler': 'JdRGC-w9syA',
            'inception': 'YoHD9XEInc0',
            'fight club': 'SUXWAEX2jlg',
            'forrest gump': 'bLvqoHBptjg',
            'star wars': 'vZ734NWnAHA',
            'lord of the rings': 'V75dMMIW2B4',
            'goodfellas': 'qo5jJpHtI1Y',
            'the matrix': 'm8e-FF8MsqU',
            'city of god': '6AS-Qs_UmAk',
            'se7en': 'znmZoVkCjpI',
            'interstellar': 'zSWdZVtXT7E',
            'the silence of the lambs': 'W6Mm8Sbe__o',
            'saving private ryan': 'RYExstiQlLs',
            'jurassic park': 'QWBKEmWWL38',
            'spirited away': 'ByXuk9QqQkk',
            'titanic': 'kVrqfYjkTdQ',
            'gladiator': 'owK1qxDselE',
            'the lion king': '4sj1MT05lAA',
            'avengers': '6ZfuNTqbHE8',
            'terminator': 'k64P4l2Wmeg',
            'back to the future': 'qvsgGtivCgs',
            'indiana jones': '0xQSIdSRlAk',
            'psycho': 'NG3-GlvKPcg',
            'aliens': 'XKSQmYUaIyE',
            'apocalypse now': 'FTjG-Aux_yQ',
            'memento': '0vS0E9bBSL0',
            'american beauty': 'Ly7rq5EsTC8',
            'casino': 'EJXDMwGWhoA',
            'vertigo': 'Z0wBrP2QhcU',
            'django': 'sY1S34yYLFI',
            'batman': 'mqqft2x_Aa4',
            'alien': 'svnAD0TApb8',
            '2001': 'oR_e9y-bka0',
            'reservoir dogs': 'vayksn4Y93A',
            'braveheart': 'nMft5QDOHek',
            'amelie': 'HUECWi5pX7o',
            'taxi driver': 'UUxD4-dEzn0',
            'scarface': '7pQQHnqBa2E',
            'die hard': '2TQ-pOjI6Ro',
            'wizard of oz': 'njdreZXdnw8',
            'heat': 'KuCin0YFoAg',
            'blade runner': 'gCcx85zbxz4',
            'toy story': 'wmiIUN-7qhE',
            'the departed': 'iojhqm0JTW4',
            'citizen kane': 'zyv19bg0tII',
            'american history x': 'nOzR5Jnd6bU',
            'top gun': 'xa_z57UatDY',
            'v for vendetta': 'lSA7mAHolAw',
            'no country for old men': 'YOohwZE5cxE',
            'the sixth sense': 'VG9AGf66tXM'
        };
        
        // Convert movie title to lowercase for matching
        const lowerTitle = title.toLowerCase();
        let videoId = null;
        
        // Check if movie title contains any known movie keywords
        for (const movieKeyword in knownTrailers) {
            if (lowerTitle.includes(movieKeyword)) {
                videoId = knownTrailers[movieKeyword];
                break;
            }
        }
        
        if (videoId) {
            // Use direct video ID for known trailers
            $scope.trailerUrl = `https://www.youtube.com/embed/${videoId}`;
            $scope.trailerLoading = false;
        } else {
            // For unknown movies, we'll use a direct YouTube search embed
            // This creates a video player that shows search results
            const searchQuery = encodeURIComponent(`${title} ${year} official trailer`);
            
            // Try three different embed formats that may work
            const randomSelector = Math.floor(Math.random() * 3);
            
            if (randomSelector === 0) {
                // Format 1: Basic search
                $scope.trailerUrl = `https://www.youtube.com/embed?search=${searchQuery}&autoplay=0`;
            } else if (randomSelector === 1) {
                // Format 2: Search with playlist approach
                $scope.trailerUrl = `https://www.youtube.com/embed/videoseries?list=${searchQuery}`;
            } else {
                // Format 3: Use a common trailer channel with search parameters
                $scope.trailerUrl = `https://www.youtube.com/embed?enablejsapi=1&origin=https://www.youtube.com&widgetid=1&search=${searchQuery}`;
            }
            
            // Also provide a direct search link as a fallback
            $scope.trailerSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            $scope.trailerLoading = false;
        }
    }

    // Function to add movie to wishlist
    $scope.addToWishlist = function() {
        $http.post('/api/wishlist/add', {
            movieId: $scope.movie.imdbID,
            title: $scope.movie.Title,
            year: $scope.movie.Year,
            poster: $scope.movie.Poster
        })
        .then(function(response) {
            alert('Movie added to wishlist!');
        })
        .catch(function(error) {
            console.error('Error adding to wishlist:', error);
            $scope.errorMessage = 'Failed to add movie to wishlist';
        });
    };

    // Load comments
    function loadComments() {
        $http.get(`/api/movies/${movieId}/comments`)
            .then(function(response) {
                $scope.comments = response.data.comments;
                $scope.averageRating = response.data.averageRating;
                $scope.ratingsCount = response.data.ratingsCount;
            })
            .catch(function(error) {
                $scope.errorMessage = 'Error loading comments';
                console.error('Error:', error);
            });
    }

    // Submit comment
    $scope.submitComment = function() {
        if (!$scope.newComment || !$scope.newComment.text || !$scope.newComment.rating) {
            $scope.errorMessage = 'Please provide both comment text and rating';
            return;
        }

        $http.post(`/api/movies/${movieId}/comments`, {
            text: $scope.newComment.text,
            rating: $scope.newComment.rating
        })
        .then(function(response) {
            $scope.comments = response.data.movie.comments;
            $scope.averageRating = response.data.movie.averageRating;
            $scope.ratingsCount = response.data.movie.ratingsCount;
            $scope.newComment = { text: '', rating: null };
            $scope.errorMessage = null;
        })
        .catch(function(error) {
            $scope.errorMessage = 'Error posting comment';
            console.error('Error:', error);
        });
    };

    // Select rating
    $scope.selectRating = function(rating) {
        $scope.newComment.rating = rating;
    };

    // Logout function
    $scope.logout = function() {
        $cookies.remove('user');
        $window.location.href = '/signup';
    };
});

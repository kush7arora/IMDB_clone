angular.module('wishlistApp', [])
  .controller('WishlistController', ['$scope', '$http', function($scope, $http) {
    $scope.wishlist = [];
    $scope.errorMessage = '';

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

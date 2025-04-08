// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// POST endpoint to add a movie to wishlist
router.post('/add', wishlistController.addToWishlist);

// GET endpoint to fetch the user's wishlist
router.get('/', wishlistController.getWishlist);

// Test auth endpoint
router.get('/test-auth', (req, res) => {
  const result = {
    cookieExists: !!req.cookies.user,
    cookieValue: req.cookies.user,
    allCookies: req.cookies,
    parsedData: null,
    error: null
  };
  
  try {
    if (req.cookies.user) {
      result.parsedData = JSON.parse(req.cookies.user);
    }
  } catch (error) {
    result.error = error.message;
  }
  
  res.json(result);
});

// Unified endpoint to remove movies from wishlist
// Use the same controller method for both POST and DELETE
router.delete('/remove/:movieId', wishlistController.removeMovie);
router.post('/remove', wishlistController.removeMovie);

module.exports = router;

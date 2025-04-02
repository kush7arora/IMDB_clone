// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// POST endpoint to add a movie to wishlist
router.post('/add', wishlistController.addToWishlist);

// GET endpoint to fetch the user's wishlist
router.get('/', wishlistController.getWishlist);

// DELETE endpoint to remove a movie from wishlist
router.delete('/remove/:movieId', wishlistController.removeFromWishlist);

module.exports = router;

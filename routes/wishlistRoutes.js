// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');


router.post('/add', wishlistController.addToWishlist);


router.get('/', wishlistController.getWishlist);


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


router.delete('/remove/:movieId', wishlistController.removeMovie);
router.post('/remove', wishlistController.removeMovie);

module.exports = router;

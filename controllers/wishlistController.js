// controllers/wishlistController.js
const User = require('../models/user');

exports.addToWishlist = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.session.user.id;
    const movie = req.body; // The movie details sent from the client

    // Add movie to the wishlist array (avoid duplicates if needed)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { wishlist: movie } },
      { new: true }
    );

    res.json({ message: 'Movie added to wishlist', wishlist: updatedUser.wishlist });
  } catch (error) {
    console.error('Error adding movie to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

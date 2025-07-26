
const User = require('../models/user');

exports.addToWishlist = async (req, res) => {
  try {
  
    if (!req.cookies.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
      if (!userData || !userData.id) {
        return res.status(401).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ message: 'Invalid user session' });
    }

    const userId = userData.id;
    const movieData = req.body; 

    
    const movie = {
      movieId: movieData.movieId || movieData.imdbID,
      title: movieData.title || movieData.Title,
      year: movieData.year || movieData.Year,
      poster: movieData.poster || movieData.Poster
    };

    
    if (!movie.movieId || !movie.title) {
      return res.status(400).json({ 
        message: 'Invalid movie data',
        received: movieData 
      });
    }

    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: movie } }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Movie added to wishlist', wishlist: updatedUser.wishlist });
  } catch (error) {
    console.error('Error adding movie to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    
    if (!req.cookies.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
      if (!userData || !userData.id) {
        return res.status(401).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ message: 'Invalid user session' });
    }

    const userId = userData.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.removeMovie = async (req, res) => {
  try {
    console.log('removeMovie called, method:', req.method);
    console.log('Body:', req.body);
    console.log('Params:', req.params);
    
    
    if (!req.cookies.user) {
      console.error('No user cookie found in request');
      return res.status(401).json({ message: 'Unauthorized', cookies: req.cookies });
    }

    
    let movieId;
    if (req.method === 'DELETE') {
      movieId = req.params.movieId;
    } else {
      movieId = req.body.movieId;
    }
    
    console.log('Extracted movieId:', movieId);
    
    if (!movieId) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }
    
    
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
      if (!userData || !userData.id) {
        return res.status(401).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ message: 'Invalid user session' });
    }
    
    const userId = userData.id;
    console.log('Removing movie', movieId, 'for user', userId);
    
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: { movieId: movieId } } },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Movie removed successfully');
    
    res.json({
      message: 'Movie removed from wishlist',
      wishlist: updatedUser.wishlist,
      removed: movieId
    });
  } catch (error) {
    console.error('Error in removeMovie:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/movieController.js
const Movie = require('../models/movie');

exports.getComments = async (req, res) => {
  try {
    // Get user from cookie
    if (!req.cookies.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Safely parse the user cookie
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
      if (!userData || !userData.username) {
        return res.status(401).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ message: 'Invalid user session' });
    }

    const { id } = req.params; // movieId
    const movie = await Movie.findOne({ movieId: id });
    if (!movie) {
      return res.json({ comments: [], averageRating: 0, ratingsCount: 0 });
    }
    res.json({
      comments: movie.comments,
      averageRating: movie.averageRating,
      ratingsCount: movie.ratingsCount
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.postComment = async (req, res) => {
  try {
    // Get user from cookie
    if (!req.cookies.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Safely parse the user cookie
    let userData;
    try {
      userData = JSON.parse(req.cookies.user);
      if (!userData || !userData.username) {
        return res.status(401).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ message: 'Invalid user session' });
    }

    const { id } = req.params; // movieId
    const { text, rating } = req.body;

    // Validate input
    if (!text || !rating) {
      return res.status(400).json({ message: 'Comment text and rating are required' });
    }

    let movie = await Movie.findOne({ movieId: id });
    if (!movie) {
      // Create new movie document if it doesn't exist
      movie = new Movie({ movieId: id, comments: [], averageRating: 0, ratingsCount: 0 });
    }

    // Add the new comment with username from cookie
    movie.comments.push({ 
      username: userData.username, 
      text, 
      rating: Number(rating) 
    });
    movie.ratingsCount += 1;
    // Update average rating
    const totalRating = movie.comments.reduce((sum, c) => sum + Number(c.rating), 0);
    movie.averageRating = totalRating / movie.ratingsCount;

    await movie.save();
    res.json({ message: 'Comment added', movie });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

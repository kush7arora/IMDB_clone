// controllers/movieController.js
const Movie = require('../models/movie');

exports.getComments = async (req, res) => {
  try {
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.postComment = async (req, res) => {
  try {
    const { id } = req.params; // movieId
    const { username, text, rating } = req.body;

    let movie = await Movie.findOne({ movieId: id });
    if (!movie) {
      // Create new movie document if it doesn't exist
      movie = new Movie({ movieId: id, comments: [], averageRating: 0, ratingsCount: 0 });
    }

    // Add the new comment
    movie.comments.push({ username, text, rating });
    movie.ratingsCount += 1;
    // Update average rating
    const totalRating = movie.comments.reduce((sum, c) => sum + c.rating, 0);
    movie.averageRating = totalRating / movie.ratingsCount;

    await movie.save();
    res.json({ message: 'Comment added', movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

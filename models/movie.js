const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const MovieSchema = new Schema({
  movieId: { type: String, required: true, unique: true },
  comments: [CommentSchema],
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Movie', MovieSchema);

// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: { type: Array, default: [] }  // store movie objects here
});

module.exports = mongoose.model('User', UserSchema);

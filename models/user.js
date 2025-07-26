// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    maxlength: 10 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  password: { 
    type: String, 
    required: true 
  },
  age: { 
    type: Number, 
    required: true,
    min: 0,
    max: 112
  },
  address: { 
    type: String, 
    required: true,
    maxlength: 16
  },
  phoneNumber: { 
    type: String, 
    required: true
  },
  wishlist: { 
    type: Array, 
    default: [] 
  }  // store movie objects here
});

module.exports = mongoose.model('User', UserSchema);

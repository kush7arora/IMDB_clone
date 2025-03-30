// controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create and save the new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    
    // Optionally, automatically log the user in after signup
    req.session.user = { id: newUser._id, username: newUser.username };
    
    res.status(201).json({ message: 'User created successfully' });
    
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Lookup user in MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set user info in session
    req.session.user = { id: user._id, username: user.username };
    return res.json({ message: 'Login successful' });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

exports.logout = (req, res) => {
  // Destroy the session on logout
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', err });
    }
    res.clearCookie('connect.sid'); // Default cookie name for sessions
    return res.json({ message: 'Logout successful' });
  });
};

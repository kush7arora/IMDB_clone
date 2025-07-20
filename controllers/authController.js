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
    
    // Set user cookie with full user object
    const userData = { id: newUser._id, username: newUser.username };
    res.cookie('user', JSON.stringify(userData), {
      path: '/',
      httpOnly: true, // Allow JavaScript access
      secure: true, // Always true for production/cross-site
      sameSite: 'None' // Required for cross-site cookies
    });
    
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
    
    // Set user cookie with full user object
    const userData = { id: user._id, username: user.username };
    res.cookie('user', JSON.stringify(userData), {
      path: '/',
      httpOnly: false, // Allow JavaScript access
      secure: true, // Always true for production/cross-site
      sameSite: 'None' // Required for cross-site cookies
    });
    
    return res.json({ message: 'Login successful' });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

exports.logout = (req, res) => {
  // Clear the user cookie
  res.clearCookie('user', { path: '/' });
  return res.json({ message: 'Logout successful' });
};

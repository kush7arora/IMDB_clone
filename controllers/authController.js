
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
  const { username, email, password, age, address, phoneNumber } = req.body;
  
  try {
    
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists' 
      });
    }
    
    
    if (!username || !email || !password || !age || !address || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    
    if (username.length > 10) {
      return res.status(400).json({ message: 'Username cannot exceed 10 characters' });
    }
    
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    
    if (isNaN(age) || age < 0 || age > 112) {
      return res.status(400).json({ message: 'Age must be between 0 and 112' });
    }
    
    
    if (address.length > 16) {
      return res.status(400).json({ message: 'Address cannot exceed 16 characters' });
    }
    
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      age: parseInt(age),
      address,
      phoneNumber
    });
    
    await newUser.save();
    
    
    const userData = { id: newUser._id, username: newUser.username };
    res.cookie('user', JSON.stringify(userData), { 
      path: '/',
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.status(201).json({ message: 'User created successfully' });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
   
    const userData = { id: user._id, username: user.username };
    res.cookie('user', JSON.stringify(userData), { 
      path: '/',
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return res.json({ message: 'Login successful' });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

exports.logout = (req, res) => {
  
  res.clearCookie('user', { path: '/' });
  return res.json({ message: 'Logout successful' });
};

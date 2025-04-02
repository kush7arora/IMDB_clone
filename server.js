// server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const sessionConfig = require('./config/sessions');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const path = require('path');
const app = express();
const movieRoutes = require('./routes/movieRoutes');
const cors = require('cors');

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionConfig);
app.use(cors({
  origin: 'http://localhost:5050',
  credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/movies', movieRoutes);

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Page Routes
app.get('/', (req, res) => {
  res.redirect('/movies');
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movies.html'));
});

app.get('/wishlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wishlist.html'));
});

app.get('/movie-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movieDetails.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

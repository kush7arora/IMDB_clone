// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for user registration
router.post('/signup', authController.signup);

// Route for user login
router.post('/login', authController.login);

// Route for user logout
router.post('/logout', authController.logout);

module.exports = router;

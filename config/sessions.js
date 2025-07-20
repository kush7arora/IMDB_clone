// config/session.js
const session = require('express-session');
require('dotenv').config();

const sessionConfig = session({
  secret: process.env.SESSION_SECRET, // use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, 
    httpOnly: true, // Secure cookies
    secure: true,
    sameSite: 'None'
  },
});

module.exports = sessionConfig;

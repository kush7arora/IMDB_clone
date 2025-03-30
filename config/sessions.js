// config/session.js
const session = require('express-session');

const sessionConfig = session({
  secret: '23BIT0002@kushArora', // use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, 
  },
});

module.exports = sessionConfig;

const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

console.log('Auth routes loaded successfully');

// Test route
router.get('/test', (req, res) => {
  console.log('Auth test route hit');
  res.json({ message: 'Auth routes are working!' });
});

// Test POST route
router.post('/test-post', (req, res) => {
  console.log('Auth POST test route hit with body:', req.body);
  res.json({ message: 'Auth POST routes are working!', body: req.body });
});

// Register
router.post('/register', register);

// Login
router.post('/login', (req, res, next) => {
  console.log('Login route hit');
  login(req, res, next);
});

// Get profile
router.get('/profile', auth, getProfile);

// Update profile
router.put('/profile', auth, updateProfile);

module.exports = router;

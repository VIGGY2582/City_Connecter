const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get profile
router.get('/profile', auth, getProfile);

// Update profile
router.put('/profile', auth, updateProfile);

module.exports = router;

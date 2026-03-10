const express = require('express');
const {
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, authorize('admin'), getAllUsers);

// Update user (admin only)
router.put('/users/:id', auth, authorize('admin'), updateUser);

// Delete user (admin only)
router.delete('/users/:id', auth, authorize('admin'), deleteUser);

module.exports = router;

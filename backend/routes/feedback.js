const express = require('express');
const {
  createFeedback,
  getFeedbackByComplaintId,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create feedback
router.post('/', auth, createFeedback);

// Get feedback by complaint ID
router.get('/complaint/:id', auth, getFeedbackByComplaintId);

// Get feedback statistics (admin only)
router.get('/stats/all', auth, authorize('admin'), getFeedbackStats);

module.exports = router;

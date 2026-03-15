const express = require('express');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, getUserNotifications);

// Mark all notifications as read
router.put('/read-all', auth, markAllNotificationsAsRead);

// Get unread count
router.get('/unread/count', auth, getUnreadCount);

// Mark notification as read
router.put('/:id/read', auth, markNotificationAsRead);

module.exports = router;

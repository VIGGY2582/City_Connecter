const Notification = require('../models/Notification');

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const count = await Notification.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      data: {
        message: `${count} notifications marked as read`
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};

const pool = require('../config/db');

class Notification {
  static async create(notificationData) {
    const { user_id, message } = notificationData;
    const query = `
      INSERT INTO notifications (user_id, message)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [user_id, message];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async markAsRead(id) {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0].count;
  }
}

module.exports = Notification;

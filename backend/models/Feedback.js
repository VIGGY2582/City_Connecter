const pool = require('../config/db');

class Feedback {
  static async create(feedbackData) {
    const { complaint_id, rating, comments } = feedbackData;
    const query = `
      INSERT INTO feedback (complaint_id, rating, comments)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [complaint_id, rating, comments];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByComplaintId(complaintId) {
    const query = `
      SELECT f.*, u.name as user_name
      FROM feedback f
      LEFT JOIN users u ON f.complaint_id = (
        SELECT user_id FROM complaints WHERE id = f.complaint_id
      )
      WHERE f.complaint_id = $1
    `;
    const result = await pool.query(query, [complaintId]);
    return result.rows;
  }

  static async getAverageRating() {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_feedbacks
      FROM feedback
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Feedback;

const pool = require('../config/db');

class Complaint {
  static async create(complaintData) {
    const { title, description, category, image_url, location, priority, user_id } = complaintData;
    const query = `
      INSERT INTO complaints (title, description, category, image_url, location, priority, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [title, description, category, image_url, location, priority, user_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT c.*, u.name as user_name, d.department_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT c.*, u.name as user_name, d.department_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT c.*, d.department_name
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByDepartmentId(departmentId) {
    const query = `
      SELECT c.*, u.name as user_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.department_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE complaints 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const values = [status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async assignDepartment(id, departmentId) {
    const query = `
      UPDATE complaints 
      SET department_id = $1, status = 'Assigned', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const values = [departmentId, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'Assigned' THEN 1 END) as assigned,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
      FROM complaints
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Complaint;

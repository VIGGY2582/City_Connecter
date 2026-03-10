const pool = require('../config/db');

class User {
  static async create(userData) {
    const { name, email, password, role, phone, department_id } = userData;
    const query = `
      INSERT INTO users (name, email, password, role, phone, department_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role, phone, department_id, created_at
    `;
    const values = [name, email, password, role, phone, department_id || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role, phone, department_id, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateProfile(id, userData) {
    const { name, phone } = userData;
    const query = `
      UPDATE users 
      SET name = $1, phone = $2
      WHERE id = $3
      RETURNING id, name, email, role, phone, department_id, created_at
    `;
    const values = [name, phone, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;

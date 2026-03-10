const pool = require('../config/db');

class Department {
  static async getAll() {
    const query = 'SELECT * FROM departments ORDER BY department_name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM departments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(departmentData) {
    const { department_name, email } = departmentData;
    const query = `
      INSERT INTO departments (department_name, email)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [department_name, email];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, departmentData) {
    const { department_name, email } = departmentData;
    const query = `
      UPDATE departments 
      SET department_name = $1, email = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [department_name, email, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM departments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Department;

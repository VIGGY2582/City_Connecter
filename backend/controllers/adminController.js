const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at, d.department_name, d.id as department_id
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      ORDER BY u.id
    `;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    const userId = req.params.id;

    // Build update query dynamically
    let updateFields = ['name = $1', 'email = $2', 'role = $3', 'department_id = $4'];
    let queryParams = [name, email, role, department_id || null];
    let paramIndex = 5;

    // Add password to update if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${paramIndex}`);
      queryParams.push(hashedPassword);
      paramIndex++;
    }

    queryParams.push(userId); // Add userId for WHERE clause

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deletion of main admin (id = 1)
    if (userId == 1) {
      return res.status(403).json({ message: 'Cannot delete main admin user' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user (complaints will be deleted due to CASCADE)
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser
};

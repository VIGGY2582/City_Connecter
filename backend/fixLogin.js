const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function fixLoginIssue() {
  try {
    console.log('🔧 Fixing Login Issue...\n');
    
    // Check if electricity department user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['electricity@cityconnector.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Electricity Department user not found. Creating...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password', 10);
      
      // Create user
      const insertResult = await pool.query(`
        INSERT INTO users (name, email, password, role, department_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, department_id
      `, [
        'Electricity Department',
        'electricity@cityconnector.com',
        hashedPassword,
        'department',
        5
      ]);
      
      console.log('✅ Created user:', insertResult.rows[0]);
    } else {
      console.log('✅ User exists:', userResult.rows[0]);
      
      // Update department_id if missing
      if (!userResult.rows[0].department_id) {
        await pool.query(
          'UPDATE users SET department_id = $1 WHERE email = $2',
          [5, 'electricity@cityconnector.com']
        );
        console.log('✅ Updated department_id to 5');
      }
    }
    
    // Test login by checking user
    const testUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['electricity@cityconnector.com']
    );
    
    console.log('\n🔍 Final User Data:');
    console.log(JSON.stringify(testUser.rows[0], null, 2));
    
    console.log('\n🎯 Test Login Credentials:');
    console.log('Email: electricity@cityconnector.com');
    console.log('Password: password');
    console.log('Frontend URL: http://localhost:5176/');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixLoginIssue();

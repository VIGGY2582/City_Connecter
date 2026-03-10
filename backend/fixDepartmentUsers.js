const pool = require('./config/db');

async function fixDepartmentUsers() {
  try {
    console.log('Checking department users...\n');
    
    // Get all department users
    const usersResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.department_id, d.id as dept_id, d.department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.role = 'department'
    `);
    
    console.log('Department users found:');
    usersResult.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Dept ID: ${user.department_id}, Dept Name: ${user.department_name}`);
    });
    
    // Fix department users with wrong or null department_id
    const departments = await pool.query('SELECT id, department_name FROM departments ORDER BY id');
    console.log('\nAvailable departments:');
    departments.rows.forEach(dept => {
      console.log(`ID: ${dept.id}, Name: ${dept.department_name}`);
    });
    
    // Update department users based on email
    const updates = [
      { email: 'publicworks@cityconnector.com', deptId: 1 },
      { email: 'sanitation@cityconnector.com', deptId: 2 },
      { email: 'traffic@cityconnector.com', deptId: 3 },
      { email: 'water@cityconnector.com', deptId: 4 },
      { email: 'electricity@cityconnector.com', deptId: 5 }
    ];
    
    for (const update of updates) {
      const result = await pool.query(
        'UPDATE users SET department_id = $1 WHERE email = $2 RETURNING id, name, email, department_id',
        [update.deptId, update.email]
      );
      
      if (result.rows.length > 0) {
        console.log(`\n✅ Updated: ${result.rows[0].name} (${result.rows[0].email}) -> Department ID: ${result.rows[0].department_id}`);
      }
    }
    
    // Verify the updates
    console.log('\n🔍 Verification - Updated department users:');
    const verifyResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.department_id, d.department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.role = 'department'
    `);
    
    verifyResult.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Dept ID: ${user.department_id}, Dept Name: ${user.department_name}`);
    });
    
    console.log('\n🎉 Department users fixed successfully!');
    console.log('\n📱 Test login with:');
    console.log('Email: electricity@cityconnector.com');
    console.log('Password: password');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixDepartmentUsers();

const pool = require('./config/db');

async function testDepartmentAssignment() {
  try {
    console.log('🔍 Testing Department Assignment...\n');
    
    // Check all complaints
    const allComplaints = await pool.query(`
      SELECT c.id, c.title, c.department_id, d.department_name 
      FROM complaints c 
      LEFT JOIN departments d ON c.department_id = d.id 
      ORDER BY c.id DESC 
      LIMIT 5
    `);
    
    console.log('📋 Recent Complaints:');
    allComplaints.rows.forEach(complaint => {
      console.log(`ID: ${complaint.id}, Title: ${complaint.title}, Dept ID: ${complaint.department_id}, Dept: ${complaint.department_name}`);
    });
    
    // Check electricity department complaints specifically
    const electricityComplaints = await pool.query(`
      SELECT c.id, c.title, c.status, c.department_id, d.department_name 
      FROM complaints c 
      LEFT JOIN departments d ON c.department_id = d.id 
      WHERE c.department_id = 5
      ORDER BY c.id DESC
    `);
    
    console.log('\n⚡ Electricity Department Complaints:');
    if (electricityComplaints.rows.length === 0) {
      console.log('❌ No complaints assigned to Electricity Department');
    } else {
      electricityComplaints.rows.forEach(complaint => {
        console.log(`ID: ${complaint.id}, Title: ${complaint.title}, Status: ${complaint.status}`);
      });
    }
    
    // Check department users
    const deptUsers = await pool.query(`
      SELECT u.id, u.name, u.email, u.department_id, d.department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.role = 'department' AND u.email LIKE '%electricity%'
    `);
    
    console.log('\n👤 Electricity Department Users:');
    deptUsers.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Dept ID: ${user.department_id}`);
    });
    
    // Create a test complaint assigned to electricity department if none exist
    if (electricityComplaints.rows.length === 0) {
      console.log('\n🔧 Creating test complaint for Electricity Department...');
      
      // First get a user ID (admin or any citizen)
      const userResult = await pool.query('SELECT id FROM users WHERE role = \'citizen\' LIMIT 1');
      const userId = userResult.rows[0]?.id || 1;
      
      const insertResult = await pool.query(`
        INSERT INTO complaints (title, description, category, location, status, priority, user_id, department_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, department_id
      `, [
        'Test Street Light Issue',
        'The street light at main street is not working',
        'Infrastructure',
        'Main Street & 5th Avenue',
        'Assigned',
        'High',
        userId,
        5 // Electricity Department ID
      ]);
      
      if (insertResult.rows.length > 0) {
        console.log('✅ Created test complaint:');
        console.log(`ID: ${insertResult.rows[0].id}, Title: ${insertResult.rows[0].title}, Dept ID: ${insertResult.rows[0].department_id}`);
      }
    }
    
    console.log('\n🎯 Test complete! Now try logging in as electricity@cityconnector.com');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testDepartmentAssignment();

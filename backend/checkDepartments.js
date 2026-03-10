const pool = require('./config/db');

async function checkAndCreateDepartments() {
  try {
    console.log('🔍 Checking departments in database...\n');
    
    // Define required departments
    const requiredDepartments = [
      { name: 'Public Works', email: 'publicworks@cityconnector.com' },
      { name: 'Sanitation', email: 'sanitation@cityconnector.com' },
      { name: 'Traffic', email: 'traffic@cityconnector.com' },
      { name: 'Water Supply', email: 'water@cityconnector.com' },
      { name: 'Electricity', email: 'electricity@cityconnector.com' }
    ];
    
    // Check existing departments
    const existingResult = await pool.query('SELECT id, department_name, email FROM departments ORDER BY id');
    console.log('📋 Existing departments:');
    existingResult.rows.forEach(dept => {
      console.log(`  ✅ ${dept.id}: ${dept.department_name} (${dept.email})`);
    });
    
    // Find missing departments
    const existingNames = existingResult.rows.map(dept => dept.department_name);
    const missingDepartments = requiredDepartments.filter(dept => !existingNames.includes(dept.name));
    
    if (missingDepartments.length > 0) {
      console.log('\n🔧 Creating missing departments:');
      
      for (const dept of missingDepartments) {
        const insertResult = await pool.query(`
          INSERT INTO departments (department_name, email)
          VALUES ($1, $2)
          RETURNING id, department_name, email
        `, [dept.name, dept.email]);
        
        const createdDept = insertResult.rows[0];
        console.log(`  ✅ Created: ${createdDept.id}: ${createdDept.department_name} (${createdDept.email})`);
      }
    } else {
      console.log('\n✅ All departments already exist!');
    }
    
    // Show final department list
    const finalResult = await pool.query('SELECT id, department_name, email FROM departments ORDER BY id');
    console.log('\n📊 Final department list:');
    finalResult.rows.forEach(dept => {
      console.log(`  ${dept.id}: ${dept.department_name} (${dept.email})`);
    });
    
    // Check and create department users
    console.log('\n👥 Checking department users...');
    
    for (const dept of finalResult.rows) {
      const userEmail = dept.email;
      const userResult = await pool.query('SELECT id, name, email, role, department_id FROM users WHERE email = $1', [userEmail]);
      
      if (userResult.rows.length === 0) {
        console.log(`  🔧 Creating user for ${dept.department_name}...`);
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password', 10);
        
        const userInsertResult = await pool.query(`
          INSERT INTO users (name, email, password, role, department_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, email, role, department_id
        `, [
          dept.department_name,
          dept.email,
          hashedPassword,
          'department',
          dept.id
        ]);
        
        const createdUser = userInsertResult.rows[0];
        console.log(`    ✅ Created user: ${createdUser.name} (ID: ${createdUser.id}, Dept ID: ${createdUser.department_id})`);
      } else {
        const user = userResult.rows[0];
        console.log(`  ✅ User exists: ${user.name} (ID: ${user.id}, Dept ID: ${user.department_id})`);
        
        // Update department_id if missing
        if (!user.department_id) {
          await pool.query('UPDATE users SET department_id = $1 WHERE email = $2', [dept.id, userEmail]);
          console.log(`    🔧 Updated department_id to ${dept.id}`);
        }
      }
    }
    
    console.log('\n🎯 Department and user setup complete!');
    console.log('\n📱 Login Credentials:');
    finalResult.rows.forEach(dept => {
      console.log(`  ${dept.department_name}:`);
      console.log(`    Email: ${dept.email}`);
      console.log(`    Password: password`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateDepartments();

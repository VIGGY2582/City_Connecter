const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function createDepartmentUsers() {
  try {
    // Hash the password "password" for all department users
    const hashedPassword = await bcrypt.hash('password', 10);

    // Department users to create
    const departmentUsers = [
      {
        name: 'Public Works Department',
        email: 'publicworks@cityconnector.com',
        role: 'department',
        department_id: 1
      },
      {
        name: 'Sanitation Department',
        email: 'sanitation@cityconnector.com',
        role: 'department',
        department_id: 2
      },
      {
        name: 'Traffic Department',
        email: 'traffic@cityconnector.com',
        role: 'department',
        department_id: 3
      },
      {
        name: 'Water Supply Department',
        email: 'water@cityconnector.com',
        role: 'department',
        department_id: 4
      },
      {
        name: 'Electricity Department',
        email: 'electricity@cityconnector.com',
        role: 'department',
        department_id: 5
      }
    ];

    for (const user of departmentUsers) {
      const query = `
        INSERT INTO users (name, email, password, role, department_id) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        department_id = EXCLUDED.department_id
        RETURNING *
      `;
      
      const values = [user.name, user.email, hashedPassword, user.role, user.department_id];
      const result = await pool.query(query, values);
      
      console.log(`✅ Created/Updated: ${result.rows[0].name} (${result.rows[0].email})`);
    }

    console.log('\n🎉 Department users created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Email: electricity@cityconnector.com');
    console.log('Password: password');
    
  } catch (error) {
    console.error('Error creating department users:', error);
  } finally {
    await pool.end();
  }
}

createDepartmentUsers();

const pool = require('./config/db');

async function viewAllUsers() {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, d.department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      ORDER BY u.id
    `);
    
    console.log('\n=== ALL REGISTERED USERS ===');
    console.log('ID | Name                | Email                     | Role      | Department      | Created At');
    console.log('---|---------------------|---------------------------|-----------|-----------------|------------');
    
    result.rows.forEach(row => {
      console.log(`${row.id.toString().padEnd(2)} | ${row.name.padEnd(19)} | ${row.email.padEnd(25)} | ${row.role.padEnd(9)} | ${(row.department_name || 'None').padEnd(15)} | ${row.created_at}`);
    });
    
    return result.rows;
  } catch (error) {
    console.error('Error viewing users:', error);
  }
}

async function deleteUser(userId) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    
    if (result.rows.length > 0) {
      console.log(`\n✅ User deleted successfully:`);
      console.log(`   Name: ${result.rows[0].name}`);
      console.log(`   Email: ${result.rows[0].email}`);
    } else {
      console.log(`\n❌ User with ID ${userId} not found`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'view') {
    await viewAllUsers();
  } else if (command === 'delete' && process.argv[3]) {
    const userId = parseInt(process.argv[3]);
    await deleteUser(userId);
  } else {
    console.log('\n📋 User Management Commands:');
    console.log('View all users:     node manageUsers.js view');
    console.log('Delete user:        node manageUsers.js delete <user_id>');
    console.log('\nExample: node manageUsers.js delete 3');
  }
  
  await pool.end();
}

main();

-- Check existing departments
SELECT id, department_name, email FROM departments ORDER BY id;

-- Create departments if they don't exist
INSERT INTO departments (department_name, email) VALUES 
('Public Works', 'publicworks@cityconnector.com'),
('Sanitation', 'sanitation@cityconnector.com'),
('Traffic', 'traffic@cityconnector.com'),
('Water Supply', 'water@cityconnector.com'),
('Electricity', 'electricity@cityconnector.com')
ON CONFLICT (email) DO NOTHING;

-- Verify all departments
SELECT id, department_name, email FROM departments ORDER BY id;

-- Create department users if they don't exist
-- Password hash for "password" = $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (name, email, password, role, department_id) 
SELECT 
  d.department_name,
  d.email,
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'department',
  d.id
FROM departments d
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = d.email
);

-- Verify all department users
SELECT u.id, u.name, u.email, u.role, u.department_id, d.department_name 
FROM users u 
JOIN departments d ON u.department_id = d.id 
WHERE u.role = 'department' 
ORDER BY u.id;

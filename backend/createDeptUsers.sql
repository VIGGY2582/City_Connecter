-- Create department users with password "password"
-- The password hash is for "password" using bcrypt

INSERT INTO users (name, email, password, role, department_id) VALUES
  ('Public Works Department', 'publicworks@cityconnector.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 1),
  ('Sanitation Department', 'sanitation@cityconnector.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 2),
  ('Traffic Department', 'traffic@cityconnector.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 3),
  ('Water Supply Department', 'water@cityconnector.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 4),
  ('Electricity Department', 'electricity@cityconnector.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'department', 5)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department_id = EXCLUDED.department_id;

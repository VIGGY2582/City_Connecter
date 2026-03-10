const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test routes
app.get('/api/health', (req, res) => {
  console.log('Health check route hit');
  res.json({ status: 'OK', message: 'Test server running' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login route hit with body:', req.body);
  res.json({ 
    success: true, 
    message: 'Test login successful',
    data: {
      user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'department', department_id: 5 },
      token: 'test-token'
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

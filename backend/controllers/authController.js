const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', phone } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Generate token
    const token = generateToken(user.id);

    // Create welcome notification
    await Notification.create({
      user_id: user.id,
      message: 'Welcome to City Connector! You can now submit complaints.'
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department_id: user.department_id
        },
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login function called with body:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    console.log('User found:', user ? 'Yes' : 'No', 'User data:', user);
    if (!user) {
      console.log('User not found, returning 404');
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    if (!isMatch) {
      console.log('Invalid password, returning 401');
      return res.status(401).json({ 
        message: 'Invalid password' 
      });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('Token generated successfully');

    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department_id: user.department_id
        },
        token
      }
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.updateProfile(req.user.id, { name, phone });
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};

const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getUserComplaints,
  getDepartmentComplaints,
  updateComplaintStatus,
  assignDepartment,
  getComplaintStats
} = require('../controllers/complaintController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create complaint (protected route)
router.post('/', auth, upload.single('image'), createComplaint);

// Get all complaints (admin only)
router.get('/', auth, authorize('admin'), getAllComplaints);

// Get complaint by ID
router.get('/:id', auth, getComplaintById);

// Get user's complaints
router.get('/user/my-complaints', auth, getUserComplaints);

// Get department's complaints (department users)
router.get('/department/my-complaints', auth, authorize('department'), getDepartmentComplaints);

// Update complaint status (admin/department)
router.put('/:id/status', auth, authorize('admin', 'department'), updateComplaintStatus);

// Assign department to complaint (admin only)
router.put('/:id/assign', auth, authorize('admin'), assignDepartment);

// Get complaint statistics (admin only)
router.get('/stats', auth, authorize('admin'), getComplaintStats);

module.exports = router;

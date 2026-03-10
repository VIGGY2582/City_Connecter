const express = require('express');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentComplaints
} = require('../controllers/departmentController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all departments
router.get('/', auth, getAllDepartments);

// Get department by ID
router.get('/:id', auth, getDepartmentById);

// Create department (admin only)
router.post('/', auth, authorize('admin'), createDepartment);

// Update department (admin only)
router.put('/:id', auth, authorize('admin'), updateDepartment);

// Delete department (admin only)
router.delete('/:id', auth, authorize('admin'), deleteDepartment);

// Get department complaints (admin/department)
router.get('/:id/complaints', auth, authorize('admin', 'department'), getDepartmentComplaints);

module.exports = router;

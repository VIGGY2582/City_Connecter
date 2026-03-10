const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.getAll();
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { department_name, email } = req.body;
    const department = await Department.create({
      department_name,
      email
    });

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { department_name, email } = req.body;
    const department = await Department.update(req.params.id, {
      department_name,
      email
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    // Check if department has assigned complaints
    const complaints = await Complaint.findByDepartmentId(req.params.id);
    if (complaints.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department. It has assigned complaints.' 
      });
    }

    const department = await Department.delete(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartmentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findByDepartmentId(req.params.id);
    
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentComplaints
};

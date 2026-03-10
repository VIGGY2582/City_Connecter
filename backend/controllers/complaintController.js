const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority = 'Medium' } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const complaint = await Complaint.create({
      title,
      description,
      category,
      image_url,
      location,
      priority,
      user_id: req.user.id
    });

    // Create notification for admin
    await Notification.create({
      user_id: 1, // Assuming admin has id 1
      message: `New complaint submitted: ${title}`
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.getAll();
    
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Get feedback for this complaint
    const feedback = await Feedback.findByComplaintId(req.params.id);

    res.json({
      success: true,
      data: {
        complaint,
        feedback
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findByUserId(req.user.id);
    
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartmentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findByDepartmentId(req.user.department_id);
    
    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.updateStatus(req.params.id, status);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Create notification for user
    await Notification.create({
      user_id: complaint.user_id,
      message: `Your complaint "${complaint.title}" status updated to: ${status}`
    });

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignDepartment = async (req, res) => {
  try {
    const { department_id } = req.body;
    const complaint = await Complaint.assignDepartment(req.params.id, department_id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Create notification for user
    await Notification.create({
      user_id: complaint.user_id,
      message: `Your complaint "${complaint.title}" has been assigned to a department`
    });

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getUserComplaints,
  getDepartmentComplaints,
  updateComplaintStatus,
  assignDepartment,
  getComplaintStats
};

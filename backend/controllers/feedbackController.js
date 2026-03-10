const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

const createFeedback = async (req, res) => {
  try {
    const { complaint_id, rating, comments } = req.body;
    
    // Check if complaint exists and is resolved
    const complaint = await Complaint.findById(complaint_id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only provide feedback for resolved complaints' });
    }

    // Check if user owns the complaint
    if (complaint.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to provide feedback for this complaint' });
    }

    const feedback = await Feedback.create({
      complaint_id,
      rating,
      comments
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedbackByComplaintId = async (req, res) => {
  try {
    const feedback = await Feedback.findByComplaintId(req.params.id);
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.getAverageRating();
    
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
  createFeedback,
  getFeedbackByComplaintId,
  getFeedbackStats
};

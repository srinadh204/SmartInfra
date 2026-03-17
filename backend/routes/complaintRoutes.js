const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Setup Multer for Image Upload Module
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only (jpeg, jpg, png)!');
  }
}

// Helper to create notifications
const createNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    // In a real prod app, you might also trigger an SMS/Email service here
    console.log(`[ALERT] Notification for User ${userId}: ${message}`);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

// @route   POST /api/complaints
// @desc    Create a new damage complaint
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { damageType, description, priority, lat, lng, address } = req.body;
    
    // Get image URLs from multer
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newComplaint = new Complaint({
      userId: req.user.id,
      damageType,
      description,
      priority,
      location: {
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        address
      },
      images
    });

    const savedComplaint = await newComplaint.save();

    // Alert the citizen who submitted
    await createNotification(req.user.id, `Your complaint regarding ${damageType} damage has been successfully submitted. ID: ${savedComplaint._id}`);

    // Alert ALL admin users about the new report
    const User = require('../models/User');
    const adminUsers = await User.find({ role: 'Admin' }).select('_id');
    const citizenUser = await User.findById(req.user.id).select('name');
    const citizenName = citizenUser ? citizenUser.name : 'A citizen';
    for (const admin of adminUsers) {
      await createNotification(admin._id, `🚨 New Report: ${citizenName} submitted a "${damageType}" issue (Priority: ${priority || 'Medium'}). Click Database Feed to review.`);
    }

    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints for logged in user (Citizen)
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/complaints/all
// @desc    Get ALL complaints (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const complaints = await Complaint.find()
                                      .populate('userId', 'name email mobile')
                                      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get a single complaint by ID (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const complaint = await Complaint.findById(req.params.id)
                                     .populate('userId', 'name email mobile');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    console.error('Get single complaint error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { status, assignedTeam } = req.body;
    let updateFields = { status };
    if (assignedTeam) updateFields.assignedTeam = assignedTeam;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Alert User
    await createNotification(complaint.userId, `Status update on your complaint (${complaint.damageType}): Now marked as ${status}.`);

    res.json(complaint);
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/complaints/:id/edit
// @desc    Edit a complaint (Citizen only, max 2 edits, only if Submitted or Under Review)
router.put('/:id/edit', auth, upload.array('images', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Must own the complaint
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this report' });
    }

    // Only editable during Submitted or Under Review
    const editableStatuses = ['Submitted', 'Under Review'];
    if (!editableStatuses.includes(complaint.status)) {
      return res.status(400).json({ message: 'Report can only be edited while Submitted or Under Review' });
    }

    // Max 2 edits
    if (complaint.editCount >= 2) {
      return res.status(400).json({ message: 'Edit limit reached. You can only edit a report 2 times.' });
    }

    const { damageType, description, priority, address, lat, lng } = req.body;

    // Update fields
    if (damageType) complaint.damageType = damageType;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;
    if (address !== undefined) complaint.location.address = address;
    if (lat) complaint.location.lat = parseFloat(lat);
    if (lng) complaint.location.lng = parseFloat(lng);

    // Replace images if new ones were uploaded
    if (req.files && req.files.length > 0) {
      complaint.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    complaint.editCount += 1;

    const updated = await complaint.save();

    const remaining = 2 - updated.editCount;
    await createNotification(
      req.user.id,
      `Your report (${updated.damageType}) has been updated. ${remaining > 0 ? `You have ${remaining} edit(s) remaining.` : 'No more edits are allowed.'}`
    );

    res.json(updated);
  } catch (error) {
    console.error('Edit complaint error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;


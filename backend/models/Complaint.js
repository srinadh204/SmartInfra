const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  damageType: {
    type: String,
    enum: ['Road', 'Bridge', 'Streetlight', 'Building', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  images: [{
    type: String // URL or path of the uploaded image
  }],
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Submitted'
  },
  assignedTeam: {
    type: String,
    default: null
  },
  editCount: {
    type: Number,
    default: 0
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

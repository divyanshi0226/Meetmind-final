// models/Summary.js - WITH AUDIO PATH
const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  meeting: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '0 min'
  },
  transcript: [{
    speaker: String,
    text: String,
    timestamp: String
  }],
  keyPoints: [{
    type: String
  }],
  actionItems: {
    type: Number,
    default: 0
  },
  actionItemsList: [{
    item: String,
    assignedTo: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  transcribed: {
    type: Boolean,
    default: false
  },
  audioFilePath: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Summary', SummarySchema);
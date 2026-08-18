const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', 
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String, 
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    term: {
      type: String,
      enum: ['Term 1', 'Term 2', 'Final'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
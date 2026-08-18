const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'quiz', 'project', 'participation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  
  date: {
    type: Date,
    default: Date.now
  },
  term: {
    type: String,
    enum: ['first', 'second', 'final'],
    default: 'first'
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 500
  }
});

module.exports = mongoose.model('Grade', gradeSchema);
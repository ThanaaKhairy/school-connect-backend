const mongoose = require('mongoose');
const Grade = require('../models/gradeModel');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// 1. Create Grade (teacher)
const createGrade = async (gradeData, teacherId) => {
  const { studentId, subject, title, score, maxScore, term } = gradeData;

  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const grade = await Grade.create({
    studentId,
    teacherId,
    subject,
    title,
    score,
    maxScore: maxScore || 100,
    term,
  });

  // Automatically create notification for parent
  if (student.parent) {
    await Notification.create({
      user: student.parent,
      type: 'GRADE_POSTED',
      title: 'New Grade Recorded',
      message: `A new grade for ${student.name} was recorded in ${subject}: ${score}/${maxScore || 100} (${title}).`,
    });
  }

  return grade;
};

// 2. Get Student Grades 
const getStudentGrades = async (studentId) => {
  const grades = await Grade.find({ studentId })
    .populate('teacherId', 'name email')
    .sort({ createdAt: -1 });

  return { count: grades.length, grades };
};

// 3. Get Subject Averages 
const getSubjectAverages = async (studentId) => {
  return await Grade.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$subject',
        averagePercentage: {
          $avg: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] },
        },
        totalAssessments: { $sum: 1 },
      },
    },
    {
      $project: {
        subject: '$_id',
        averagePercentage: { $round: ['$averagePercentage', 2] },
        totalAssessments: 1,
        _id: 0,
      },
    },
  ]);
};

// 4. Get Progress Tracking 
const getProgressTracking = async (studentId) => {
  return await Grade.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$term',
        overallAverage: {
          $avg: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] },
        },
        totalGrades: { $sum: 1 },
      },
    },
    {
      $project: {
        term: '$_id',
        overallAverage: { $round: ['$overallAverage', 2] },
        totalGrades: 1,
        _id: 0,
      },
    },
  ]);
};

module.exports = {
  createGrade,
  getStudentGrades,
  getSubjectAverages,
  getProgressTracking,
};
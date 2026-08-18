const mongoose = require('mongoose');
const Grade = require('../models/grade');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Class = require('../models/Class');

// 1. Create Grade
const createGrade = async (gradeData, teacherId) => {
  const { student: studentId, subject, title, score, maxScore, term, type, comments, date } = gradeData;

  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const grade = await Grade.create({
    student: studentId,
    teacher: teacherId,
    subject,
    type,
    title,
    score,
    maxScore: maxScore || 100,
    term: term || 'first',
    comments,
    date: date || Date.now(),
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

// 2. Get All Grades
const getAllGrades = async () => {
  return await Grade.find()
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });
};

// 3. Get Student Grades 
const getStudentGrades = async (studentId) => {
  const grades = await Grade.find({ student: studentId })
    .populate('teacher', 'name email')
    .sort({ date: -1 });

  return { count: grades.length, grades };
};

// 4. Get Class Grades
const getClassGrades = async (classId) => {
  // 1. Verify class exists
  const classExists = await Class.findById(classId);
  if (!classExists) {
    throw new Error('Class not found');
  }

  // 2. Find all students belonging to this class
  const students = await Student.find({ class: classId }).select('_id');
  const studentIds = students.map((s) => s._id);

  // 3. Retrieve grades for all students in that class
  return await Grade.find({ student: { $in: studentIds } })
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });
};
// 5. Get Subject Grades
const getSubjectGrades = async (subject) => {
  return await Grade.find({ subject })
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });
};

// 6. Update Grade
const updateGrade = async (gradeId, updateData) => {
  const grade = await Grade.findByIdAndUpdate(gradeId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!grade) {
    throw new Error('Grade not found');
  }
  return grade;
};

// 7. Delete Grade
const deleteGrade = async (gradeId) => {
  const grade = await Grade.findByIdAndDelete(gradeId);
  if (!grade) {
    throw new Error('Grade not found');
  }
  return grade;
};

// 8. Get Subject Averages 
const getSubjectAverages = async (studentId) => {
  return await Grade.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
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

// 9. Get Progress Tracking 
const getProgressTracking = async (studentId) => {
  return await Grade.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
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
  getAllGrades,
  getStudentGrades,
  getClassGrades,
  getSubjectGrades,
  updateGrade,
  deleteGrade,
  getSubjectAverages,
  getProgressTracking,
};
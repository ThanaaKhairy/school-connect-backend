const mongoose = require('mongoose');
const Grade = require('../models/grade');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Class = require('../models/Class');

// 1. Create Grade
const createGrade = async (gradeData, teacherId) => {
  const { student: studentId, subject, title, score, maxScore, term, type, comments, date } = gradeData;

  //  Validate student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  //  Validate student has a class
  if (!student.class) {
    throw new Error('Student is not assigned to any class');
  }

  //  Validate teacher is authorized (optional - can be enhanced)

  const grade = await Grade.create({
    student: studentId,
    teacher: teacherId,
    subject,
    type,
    title,
    score,
    maxScore: maxScore || 100,
    term: term || 'first',
    comments: comments || '',
    date: date || Date.now(),
  });

  //  Send notification to parent
  if (student.parent) {
    await Notification.create({
      user: student.parent,
      type: 'grade',
      title: 'New Grade Recorded',
      message: `A new grade for ${student.name} was recorded in ${subject}: ${score}/${maxScore || 100} (${title}).`,
    });
  }

  //  Populate and return
  const populatedGrade = await Grade.findById(grade._id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  return populatedGrade;
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
  //  Validate student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const grades = await Grade.find({ student: studentId })
    .populate('teacher', 'name email')
    .sort({ date: -1 });

  return { 
    student: {
      id: student._id,
      name: student.name,
      studentCode: student.studentCode
    },
    count: grades.length, 
    grades 
  };
};

// 4. Get Class Grades
const getClassGrades = async (classId) => {
  //  Verify class exists
  const classExists = await Class.findById(classId);
  if (!classExists) {
    throw new Error('Class not found');
  }

  //  Find students in class
  const students = await Student.find({ class: classId }).select('_id');
  const studentIds = students.map((s) => s._id);

  if (studentIds.length === 0) {
    return { class: { id: classId, name: classExists.name }, grades: [], count: 0 };
  }

  //  Retrieve grades
  const grades = await Grade.find({ student: { $in: studentIds } })
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });

  return { 
    class: { id: classId, name: classExists.name },
    count: grades.length,
    grades 
  };
};

// 5. Get Subject Grades
const getSubjectGrades = async (subject) => {
  //  Validate subject exists
  const grades = await Grade.find({ subject: { $regex: new RegExp(`^${subject}$`, 'i') } })
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .sort({ date: -1 });

  if (grades.length === 0) {
    return { subject, count: 0, grades: [] };
  }

  return { subject, count: grades.length, grades };
};

// 6. Update Grade
const updateGrade = async (gradeId, updateData) => {
  //  Validate grade exists
  const existingGrade = await Grade.findById(gradeId);
  if (!existingGrade) {
    throw new Error('Grade not found');
  }

  const grade = await Grade.findByIdAndUpdate(gradeId, updateData, {
    new: true,
    runValidators: true,
  })
  .populate('student', 'name email')
  .populate('teacher', 'name email');

  return grade;
};

// 7. Delete Grade
const deleteGrade = async (gradeId) => {
  //  Validate grade exists
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    throw new Error('Grade not found');
  }

  await Grade.findByIdAndDelete(gradeId);
  return { message: 'Grade deleted successfully' };
};

// 8. Get Subject Averages
const getSubjectAverages = async (studentId) => {
  //  Validate student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const averages = await Grade.aggregate([
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

  return averages;
};

// 9. Get Progress Tracking
const getProgressTracking = async (studentId) => {
  //  Validate student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const progress = await Grade.aggregate([
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

  return progress;
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
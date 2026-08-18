const gradeService = require('../services/gradeService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// 1. Record Grade
const createGrade = async (req, res) => {
  try {
    const teacherId = req.user.user_id || req.user.id;
    const grade = await gradeService.createGrade(req.body, teacherId);
    return sendSuccess(res, grade, 'Grade created successfully', 201);
  } catch (error) {
    const statusCode = error.message === 'Student not found' ? 404 : 400;
    return sendError(res, error.message, statusCode);
  }
};

// 2. Retrieve Student Grades
const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.user_id || req.user.id;
    const data = await gradeService.getStudentGrades(studentId);
    return sendSuccess(res, data, 'Grades retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 3. Get Subject Averages
const getSubjectAverages = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.user_id || req.user.id;
    const averages = await gradeService.getSubjectAverages(studentId);
    return sendSuccess(res, averages, 'Subject averages calculated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 4. Get Progress Tracking
const getProgressTracking = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.user_id || req.user.id;
    const progress = await gradeService.getProgressTracking(studentId);
    return sendSuccess(res, progress, 'Progress tracking data retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createGrade,
  getStudentGrades,
  getSubjectAverages,
  getProgressTracking,
};
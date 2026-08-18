const gradeService = require('../services/gradeService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// 1. Record Grade
const createGrade = async (req, res) => {
  try {
    const teacherId = req.user ? (req.user.user_id || req.user.id) : req.body.teacher;
    const grade = await gradeService.createGrade(req.body, teacherId);
    return sendSuccess(res, grade, 'Grade created successfully', 201);
  } catch (error) {
    const statusCode = error.message === 'Student not found' ? 404 : 400;
    return sendError(res, error.message, statusCode);
  }
};

// 2. Get All Grades
const getAllGrades = async (req, res) => {
  try {
    const grades = await gradeService.getAllGrades();
    return sendSuccess(res, grades, 'All grades retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 3. Retrieve Student Grades
const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && (req.user.user_id || req.user.id));
    const data = await gradeService.getStudentGrades(studentId);
    return sendSuccess(res, data, 'Student grades retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 4. Get Class Grades
const getClassGrades = async (req, res) => {
  try {
    const grades = await gradeService.getClassGrades(req.params.classId);
    return sendSuccess(res, grades, 'Class grades retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 5. Get Subject Grades
const getSubjectGrades = async (req, res) => {
  try {
    const grades = await gradeService.getSubjectGrades(req.params.subject);
    return sendSuccess(res, grades, 'Subject grades retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 6. Update Grade
const updateGrade = async (req, res) => {
  try {
    const grade = await gradeService.updateGrade(req.params.id, req.body);
    return sendSuccess(res, grade, 'Grade updated successfully', 200);
  } catch (error) {
    const statusCode = error.message === 'Grade not found' ? 404 : 400;
    return sendError(res, error.message, statusCode);
  }
};

// 7. Delete Grade
const deleteGrade = async (req, res) => {
  try {
    await gradeService.deleteGrade(req.params.id);
    return sendSuccess(res, null, 'Grade deleted successfully', 200);
  } catch (error) {
    const statusCode = error.message === 'Grade not found' ? 404 : 400;
    return sendError(res, error.message, statusCode);
  }
};

// 8. Get Subject Averages
const getSubjectAverages = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && (req.user.user_id || req.user.id));
    const averages = await gradeService.getSubjectAverages(studentId);
    return sendSuccess(res, averages, 'Subject averages calculated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// 9. Get Progress Tracking
const getProgressTracking = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user && (req.user.user_id || req.user.id));
    const progress = await gradeService.getProgressTracking(studentId);
    return sendSuccess(res, progress, 'Progress tracking data retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
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
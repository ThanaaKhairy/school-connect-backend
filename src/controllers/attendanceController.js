const attendanceService = require('../services/attendanceService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  markAttendanceSchema,
  getAttendanceQuerySchema,
  summaryQuerySchema,
} = require('../validators/attendanceValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

// ==================== MARK / UPDATE ATTENDANCE ====================
const markAttendance = async (req, res) => {
  try {
    const validatedData = validate(markAttendanceSchema, req.body);
    const result = await attendanceService.markAttendance(validatedData, req.user);
    sendSuccess(res, result, 'Attendance marked successfully', 201);
  } catch (error) {
    if (error.message === 'Student not found' || error.message === 'Class not found for student') {
      return sendError(res, error.message, 404);
    }
    if (
      error.message.includes('not authorized') ||
      error.message.includes('Student is not assigned')
    ) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== ATTENDANCE HISTORY ====================
const getAttendanceHistory = async (req, res) => {
  try {
    const validatedQuery = validate(getAttendanceQuerySchema, req.query);
    const result = await attendanceService.getAttendanceHistory(validatedQuery, req.user);
    sendSuccess(res, result, 'Attendance history retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== WEEKLY SUMMARY ====================
const getWeeklySummary = async (req, res) => {
  try {
    const validatedQuery = validate(summaryQuerySchema, req.query);
    const result = await attendanceService.getWeeklySummary(validatedQuery, req.user);
    sendSuccess(res, result, 'Weekly attendance summary retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== MONTHLY SUMMARY ====================
const getMonthlySummary = async (req, res) => {
  try {
    const validatedQuery = validate(summaryQuerySchema, req.query);
    const result = await attendanceService.getMonthlySummary(validatedQuery, req.user);
    sendSuccess(res, result, 'Monthly attendance summary retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

module.exports = {
  markAttendance,
  getAttendanceHistory,
  getWeeklySummary,
  getMonthlySummary,
};

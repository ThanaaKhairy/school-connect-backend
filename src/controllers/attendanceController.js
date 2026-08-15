const attendanceService = require('../services/attendanceService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
  updateAttendanceSchema,
  idParamSchema,
  studentParamSchema,
  classParamSchema,
  getAttendanceQuerySchema,
  statsQuerySchema,
} = require('../validators/attendanceValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

// 1. Mark single attendance (Strictly Today only)
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

// 2. Bulk mark attendance (Today only)
const bulkMarkAttendance = async (req, res) => {
  try {
    const validatedData = validate(bulkMarkAttendanceSchema, req.body);
    const result = await attendanceService.bulkMarkAttendance(validatedData, req.user);
    sendSuccess(res, result, result.message, 201);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 3. Update attendance record by ID
const updateAttendance = async (req, res) => {
  try {
    const validatedParams = validate(idParamSchema, req.params);
    const validatedData = validate(updateAttendanceSchema, req.body);
    const result = await attendanceService.updateAttendance(
      validatedParams.id,
      validatedData,
      req.user
    );
    sendSuccess(res, result, 'Attendance updated successfully', 200);
  } catch (error) {
    if (error.message === 'Attendance record not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 4. Delete attendance record by ID
const deleteAttendance = async (req, res) => {
  try {
    const validatedParams = validate(idParamSchema, req.params);
    const result = await attendanceService.deleteAttendance(validatedParams.id, req.user);
    sendSuccess(res, result, result.message, 200);
  } catch (error) {
    if (error.message === 'Attendance record not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 5. Get student attendance
const getStudentAttendance = async (req, res) => {
  try {
    const validatedParams = validate(studentParamSchema, req.params);
    const validatedQuery = validate(getAttendanceQuerySchema, req.query);
    const result = await attendanceService.getStudentAttendance(
      validatedParams.studentId,
      validatedQuery,
      req.user
    );
    sendSuccess(res, result, 'Student attendance retrieved successfully', 200);
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

// 6. Get class attendance
const getClassAttendance = async (req, res) => {
  try {
    const validatedParams = validate(classParamSchema, req.params);
    const validatedQuery = validate(getAttendanceQuerySchema, req.query);
    const result = await attendanceService.getClassAttendance(
      validatedParams.classId,
      validatedQuery,
      req.user
    );
    sendSuccess(res, result, 'Class attendance retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 7. Get today's class attendance
const getTodayAttendance = async (req, res) => {
  try {
    const validatedParams = validate(classParamSchema, req.params);
    const result = await attendanceService.getTodayAttendance(validatedParams.classId, req.user);
    sendSuccess(res, result, "Today's attendance retrieved successfully", 200);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 8. Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const validatedQuery = validate(statsQuerySchema, req.query);
    const result = await attendanceService.getAttendanceStats(validatedQuery, req.user);
    sendSuccess(res, result, 'Attendance statistics retrieved successfully', 200);
  } catch (error) {
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// 9. General Attendance History
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

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getClassAttendance,
  getTodayAttendance,
  getAttendanceStats,
  getAttendanceHistory,
};

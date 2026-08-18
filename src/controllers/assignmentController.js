const assignmentService = require('../services/assignmentService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  createAssignmentSchema,
  updateAssignmentSchema,
  getAssignmentsQuerySchema,
} = require('../validators/assignmentValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

const createAssignment = async (req, res) => {
  try {
    const validatedData = validate(createAssignmentSchema, req.body);
    const result = await assignmentService.createAssignment(validatedData, req.user);
    sendSuccess(res, result, 'Assignment created successfully', 201);
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

const getAllAssignments = async (req, res) => {
  try {
    const validatedQuery = validate(getAssignmentsQuerySchema, req.query);
    const result = await assignmentService.getAllAssignments(validatedQuery, req.user);
    sendSuccess(res, result, 'Assignments retrieved successfully', 200);
  } catch (error) {
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await assignmentService.getAssignmentById(id, req.user);
    sendSuccess(res, result, 'Assignment retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Assignment not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = validate(updateAssignmentSchema, req.body);
    const result = await assignmentService.updateAssignment(id, validatedData, req.user);
    sendSuccess(res, result, 'Assignment updated successfully', 200);
  } catch (error) {
    if (error.message === 'Assignment not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await assignmentService.deleteAssignment(id, req.user);
    sendSuccess(res, result, 'Assignment deleted successfully', 200);
  } catch (error) {
    if (error.message === 'Assignment not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await assignmentService.getAssignmentsByClass(classId, req.user);
    sendSuccess(res, result, 'Class assignments retrieved successfully', 200);
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

const getAssignmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await assignmentService.getAssignmentsByStudent(studentId, req.user);
    sendSuccess(res, result, 'Student assignments retrieved successfully', 200);
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

const getAssignmentStats = async (req, res) => {
  try {
    const result = await assignmentService.getAssignmentStats(req.user);
    sendSuccess(res, result, 'Assignment stats retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByClass,
  getAssignmentsByStudent,
  getAssignmentStats,
};

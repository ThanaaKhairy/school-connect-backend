const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  registerUserSchema,
  updateUserSchema,
  getUsersQuerySchema
} = require('../validators/userValidator');
const {
  createStudentSchema,
  updateStudentSchema
} = require('../validators/studentValidator');
const {
  createClassSchema,
  updateClassSchema
} = require('../validators/classValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

// ==================== USER CONTROLLERS ====================

const registerUser = async (req, res) => {
  try {
    const validatedData = validate(registerUserSchema, req.body);
    const result = await adminService.registerUser(validatedData);
    sendSuccess(res, result, 'User registered successfully! Login credentials sent to email', 201);
  } catch (error) {
    if (error.message === 'Email already registered') {
      return sendError(res, error.message, 409);
    }
    sendError(res, error.message, 400);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const validatedQuery = validate(getUsersQuerySchema, req.query);
    const result = await adminService.getAllUsers(validatedQuery);
    sendSuccess(res, result, 'Users retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getUserById(id);
    sendSuccess(res, result, 'User retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = validate(updateUserSchema, req.body);
    const result = await adminService.updateUser(id, validatedData);
    sendSuccess(res, result, 'User updated successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    sendSuccess(res, result, 'User deactivated successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.activateUser(id);
    sendSuccess(res, result, 'User activated successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.hardDeleteUser(id);
    sendSuccess(res, result, 'User permanently deleted', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== STUDENT CONTROLLERS ====================

const createStudent = async (req, res) => {
  try {
    const validatedData = validate(createStudentSchema, req.body);
    const result = await adminService.createStudent(validatedData);
    sendSuccess(res, result, 'Student created successfully', 201);
  } catch (error) {
    if (error.message === 'Student code already exists') {
      return sendError(res, error.message, 409);
    }
    sendError(res, error.message, 400);
  }
};

const getAllStudents = async (req, res) => {
  try {
    const result = await adminService.getAllStudents(req.query);
    sendSuccess(res, result, 'Students retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getStudentById(id);
    sendSuccess(res, result, 'Student retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = validate(updateStudentSchema, req.body);
    const result = await adminService.updateStudent(id, validatedData);
    sendSuccess(res, result, 'Student updated successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteStudent(id);
    sendSuccess(res, result, 'Student deleted successfully', 200);
  } catch (error) {
    if (error.message === 'Student not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== CLASS CONTROLLERS ====================

const createClass = async (req, res) => {
  try {
    const validatedData = validate(createClassSchema, req.body);
    const result = await adminService.createClass(validatedData);
    sendSuccess(res, result, 'Class created successfully', 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getAllClasses = async (req, res) => {
  try {
    const result = await adminService.getAllClasses(req.query);
    sendSuccess(res, result, 'Classes retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.getClassById(id);
    sendSuccess(res, result, 'Class retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = validate(updateClassSchema, req.body);
    const result = await adminService.updateClass(id, validatedData);
    sendSuccess(res, result, 'Class updated successfully', 200);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteClass(id);
    sendSuccess(res, result, 'Class deleted successfully', 200);
  } catch (error) {
    if (error.message === 'Class not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};



module.exports = {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  hardDeleteUser,
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createAssignment = async (assignmentData, currentUser) => {
  const classObj = await Class.findById(assignmentData.class);
  if (!classObj) {
    throw new Error('Class not found');
  }

  if (currentUser.role === 'teacher') {
    const isTeacherInClass = classObj.teachers.some(
      (teacherId) => teacherId.toString() === currentUser.user_id
    );
    if (!isTeacherInClass) {
      throw new Error('You are not authorized to create assignments for this class');
    }
  }

  const assignment = await Assignment.create({
    title: assignmentData.title,
    description: assignmentData.description,
    subject: assignmentData.subject,
    teacher: currentUser.user_id,
    class: assignmentData.class,
    dueDate: new Date(assignmentData.dueDate),
    totalMarks: assignmentData.totalMarks,
    status: assignmentData.status || 'active',
  });

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate('teacher', 'name email')
    .populate('class', 'name');

  if (assignment.status === 'active') {
    try {
      const students = await Student.find({ class: assignmentData.class });
      const parentIds = [...new Set(students.map((s) => s.parent?.toString()).filter(Boolean))];

      const notifications = parentIds.map((parentId) => ({
        user: parentId,
        title: 'New Assignment',
        message: `A new assignment "${assignment.title}" has been posted for ${classObj.name}. Due: ${assignment.dueDate.toISOString().split('T')[0]}`,
        type: 'assignment',
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error('Failed to create assignment notifications:', notifError.message);
    }
  }

  return { assignment: populatedAssignment };
};

const getAllAssignments = async (queryParams, currentUser) => {
  const {
    class: classId,
    teacher,
    subject,
    status,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  const filter = {};

  if (currentUser.role === 'teacher') {
    filter.teacher = currentUser.user_id;

    if (classId) {
      const classObj = await Class.findById(classId);
      if (!classObj || !classObj.teachers.some((t) => t.toString() === currentUser.user_id)) {
        throw new Error('You are not authorized to view assignments for this class');
      }
      filter.class = classId;
    }
  } else if (currentUser.role === 'parent') {
    const parentStudents = await Student.find({ parent: currentUser.user_id });
    const classIds = [...new Set(parentStudents.map((s) => s.class?.toString()).filter(Boolean))];

    if (classIds.length === 0) {
      return { assignments: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    filter.class = { $in: classIds };
    filter.status = 'active';
  } else if (currentUser.role === 'admin') {
    if (classId) filter.class = classId;
    if (teacher) filter.teacher = teacher;
  }

  if (subject) {
    filter.subject = { $regex: subject, $options: 'i' };
  }

  if (status && currentUser.role !== 'parent') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.dueDate = {};
    if (startDate) {
      filter.dueDate.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filter.dueDate.$lte = end;
    }
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const assignments = await Assignment.find(filter)
    .populate('teacher', 'name email')
    .populate('class', 'name')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Assignment.countDocuments(filter);

  return {
    assignments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAssignmentById = async (assignmentId, currentUser) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('teacher', 'name email')
    .populate('class', 'name');

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (currentUser.role === 'teacher') {
    if (assignment.teacher._id.toString() !== currentUser.user_id) {
      throw new Error('You are not authorized to view this assignment');
    }
  } else if (currentUser.role === 'parent') {
    const parentStudents = await Student.find({ parent: currentUser.user_id });
    const classIds = parentStudents.map((s) => s.class?.toString()).filter(Boolean);
    if (!classIds.includes(assignment.class._id.toString())) {
      throw new Error('You are not authorized to view this assignment');
    }
  }

  return { assignment };
};

const updateAssignment = async (assignmentId, updateData, currentUser) => {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (currentUser.role === 'teacher') {
    if (assignment.teacher.toString() !== currentUser.user_id) {
      throw new Error('You are not authorized to update this assignment');
    }
  }

  if (updateData.dueDate) {
    updateData.dueDate = new Date(updateData.dueDate);
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('teacher', 'name email')
    .populate('class', 'name');

  return { assignment: updatedAssignment };
};

const deleteAssignment = async (assignmentId, currentUser) => {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (currentUser.role === 'teacher') {
    if (assignment.teacher.toString() !== currentUser.user_id) {
      throw new Error('You are not authorized to delete this assignment');
    }
  }

  await Assignment.findByIdAndDelete(assignmentId);

  return { message: 'Assignment deleted successfully' };
};

const getAssignmentsByClass = async (classId, currentUser) => {
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error('Class not found');
  }

  if (currentUser.role === 'teacher') {
    const isTeacherInClass = classObj.teachers.some(
      (t) => t.toString() === currentUser.user_id
    );
    if (!isTeacherInClass) {
      throw new Error('You are not authorized to view assignments for this class');
    }
  } else if (currentUser.role === 'parent') {
    const parentStudents = await Student.find({
      parent: currentUser.user_id,
      class: classId,
    });
    if (parentStudents.length === 0) {
      throw new Error('You are not authorized to view assignments for this class');
    }
  }

  const filter = { class: classId };
  if (currentUser.role === 'parent') {
    filter.status = 'active';
  }

  const assignments = await Assignment.find(filter)
    .populate('teacher', 'name email')
    .populate('class', 'name')
    .sort({ dueDate: 1 });

  return { assignments, total: assignments.length };
};

const getAssignmentsByStudent = async (studentId, currentUser) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  if (currentUser.role === 'parent') {
    if (student.parent.toString() !== currentUser.user_id) {
      throw new Error('You are not authorized to view this student\'s assignments');
    }
  } else if (currentUser.role === 'teacher') {
    const classObj = await Class.findById(student.class);
    if (!classObj || !classObj.teachers.some((t) => t.toString() === currentUser.user_id)) {
      throw new Error('You are not authorized to view this student\'s assignments');
    }
  }

  const filter = { class: student.class };
  if (currentUser.role === 'parent') {
    filter.status = 'active';
  }

  const assignments = await Assignment.find(filter)
    .populate('teacher', 'name email')
    .populate('class', 'name')
    .sort({ dueDate: 1 });

  return { student: { _id: student._id, name: student.name }, assignments, total: assignments.length };
};

const getAssignmentStats = async (currentUser) => {
  let filter = {};

  if (currentUser.role === 'teacher') {
    filter.teacher = currentUser.user_id;
  }

  const totalAssignments = await Assignment.countDocuments(filter);
  const activeAssignments = await Assignment.countDocuments({ ...filter, status: 'active' });
  const closedAssignments = await Assignment.countDocuments({ ...filter, status: 'closed' });
  const draftAssignments = await Assignment.countDocuments({ ...filter, status: 'draft' });

  const overdueAssignments = await Assignment.countDocuments({
    ...filter,
    status: 'active',
    dueDate: { $lt: new Date() },
  });

  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  const dueSoonAssignments = await Assignment.countDocuments({
    ...filter,
    status: 'active',
    dueDate: { $gte: today, $lte: endOfWeek },
  });

  return {
    stats: {
      total: totalAssignments,
      active: activeAssignments,
      closed: closedAssignments,
      draft: draftAssignments,
      overdue: overdueAssignments,
      dueSoon: dueSoonAssignments,
    },
  };
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

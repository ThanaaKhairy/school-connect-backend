const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

/**
 * Mark or update daily attendance for a student
 */
const markAttendance = async (attendanceData, currentUser) => {
  // 1. Verify student exists
  const student = await Student.findById(attendanceData.student);
  if (!student) {
    throw new Error('Student not found');
  }

  // 2. Verify student has a class assigned
  if (!student.class) {
    throw new Error('Student is not assigned to any class');
  }

  // 3. Verify teacher is authorized for student's class (admin bypasses teacher check)
  if (currentUser.role !== 'admin') {
    const classObj = await Class.findById(student.class);
    if (!classObj) {
      throw new Error('Class not found for student');
    }

    const isTeacherInClass = classObj.teachers.some(
      (teacherId) => teacherId.toString() === currentUser.user_id
    );

    if (!isTeacherInClass) {
      throw new Error('You are not authorized to mark attendance for this student\'s class');
    }
  }

  // 4. Normalize date to midnight UTC to prevent multiple records per day
  const recordDate = new Date(attendanceData.date);
  recordDate.setUTCHours(0, 0, 0, 0);

  // 5. Save or update attendance atomically (upsert)
  const attendance = await Attendance.findOneAndUpdate(
    { student: attendanceData.student, date: recordDate },
    {
      student: attendanceData.student,
      date: recordDate,
      status: attendanceData.status,
      markedBy: currentUser.user_id,
    },
    { new: true, upsert: true, runValidators: true }
  )
    .populate('student', 'name studentCode class parent')
    .populate('markedBy', 'name email');

  // 6. Trigger absence notification if status is absent
  if (attendanceData.status === 'absent' && student.parent) {
    try {
      const dateString = recordDate.toISOString().split('T')[0];
      await Notification.create({
        user: student.parent,
        title: 'Attendance Alert',
        message: `Your child ${student.name} was marked absent on ${dateString}.`,
        type: 'attendance',
      });
    } catch (notifError) {
      console.error('Failed to create absence notification:', notifError.message);
    }
  }

  return { attendance };
};

/**
 * Helper to validate user authorization for viewing student data
 */
const validateUserAccessForStudent = async (studentId, user) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  if (user.role === 'parent') {
    if (student.parent.toString() !== user.user_id) {
      throw new Error('You are not authorized to view this student\'s attendance');
    }
  } else if (user.role === 'teacher') {
    const classObj = await Class.findById(student.class);
    if (!classObj || !classObj.teachers.some((t) => t.toString() === user.user_id)) {
      throw new Error('You are not authorized to view this student\'s attendance');
    }
  }

  return student;
};

/**
 * Retrieve attendance history / absence records
 */
const getAttendanceHistory = async (queryParams, user) => {
  const { student, class: classId, date, startDate, endDate, status, page = 1, limit = 10 } = queryParams;
  const filter = {};

  // Role-based scoping
  if (user.role === 'parent') {
    const parentStudents = await Student.find({ parent: user.user_id });
    const studentIds = parentStudents.map((s) => s._id.toString());

    if (student) {
      if (!studentIds.includes(student)) {
        throw new Error('You are not authorized to view this student\'s attendance');
      }
      filter.student = student;
    } else {
      filter.student = { $in: studentIds };
    }
  } else if (user.role === 'teacher') {
    const teacherClasses = await Class.find({ teachers: { $in: [user.user_id] } });
    const classIds = teacherClasses.map((c) => c._id);
    const teacherStudents = await Student.find({ class: { $in: classIds } });
    const studentIds = teacherStudents.map((s) => s._id.toString());

    if (student) {
      if (!studentIds.includes(student)) {
        throw new Error('You are not authorized to view this student\'s attendance');
      }
      filter.student = student;
    } else if (classId) {
      const isTeacherClass = classIds.some((c) => c.toString() === classId);
      if (!isTeacherClass) {
        throw new Error('You are not authorized to view attendance for this class');
      }
      const classStudents = await Student.find({ class: classId });
      filter.student = { $in: classStudents.map((s) => s._id) };
    } else {
      filter.student = { $in: studentIds };
    }
  } else if (user.role === 'admin') {
    if (student) {
      filter.student = student;
    } else if (classId) {
      const classStudents = await Student.find({ class: classId });
      filter.student = { $in: classStudents.map((s) => s._id) };
    }
  }

  // Date filters
  if (date) {
    const dStart = new Date(date);
    dStart.setUTCHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: dStart, $lte: dEnd };
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setUTCHours(0, 0, 0, 0);
      filter.date.$gte = sDate;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = eDate;
    }
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const attendance = await Attendance.find(filter)
    .populate('student', 'name studentCode class')
    .populate('markedBy', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(filter);

  return {
    attendance,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Calculate weekly attendance summary
 */
const getWeeklySummary = async (queryParams, user) => {
  const { student: studentId, date, year, week } = queryParams;

  let targetStudentIds = [];

  if (studentId) {
    await validateUserAccessForStudent(studentId, user);
    targetStudentIds = [studentId];
  } else if (user.role === 'parent') {
    const parentStudents = await Student.find({ parent: user.user_id });
    targetStudentIds = parentStudents.map((s) => s._id);
  } else if (user.role === 'teacher') {
    const teacherClasses = await Class.find({ teachers: { $in: [user.user_id] } });
    const teacherStudents = await Student.find({ class: { $in: teacherClasses.map((c) => c._id) } });
    targetStudentIds = teacherStudents.map((s) => s._id);
  }

  // Calculate week date range
  let startOfWeek, endOfWeek;

  if (year && week) {
    // ISO week calculation
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());

    startOfWeek = new Date(ISOweekStart);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);
  } else {
    const anchorDate = date ? new Date(date) : new Date();
    const day = anchorDate.getUTCDay();
    const diffToMon = anchorDate.getUTCDate() - day + (day === 0 ? -6 : 1);

    startOfWeek = new Date(anchorDate);
    startOfWeek.setUTCDate(diffToMon);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);
  }

  const filter = {
    date: { $gte: startOfWeek, $lte: endOfWeek },
  };

  if (targetStudentIds.length > 0) {
    filter.student = targetStudentIds.length === 1 ? targetStudentIds[0] : { $in: targetStudentIds };
  }

  const records = await Attendance.find(filter);

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
  };

  records.forEach((rec) => {
    if (summary[rec.status] !== undefined) {
      summary[rec.status] += 1;
    }
  });

  return {
    summary,
    dateRange: {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
    },
  };
};

/**
 * Calculate monthly attendance summary
 */
const getMonthlySummary = async (queryParams, user) => {
  const { student: studentId, date, year, month } = queryParams;

  let targetStudentIds = [];

  if (studentId) {
    await validateUserAccessForStudent(studentId, user);
    targetStudentIds = [studentId];
  } else if (user.role === 'parent') {
    const parentStudents = await Student.find({ parent: user.user_id });
    targetStudentIds = parentStudents.map((s) => s._id);
  } else if (user.role === 'teacher') {
    const teacherClasses = await Class.find({ teachers: { $in: [user.user_id] } });
    const teacherStudents = await Student.find({ class: { $in: teacherClasses.map((c) => c._id) } });
    targetStudentIds = teacherStudents.map((s) => s._id);
  }

  let startOfMonth, endOfMonth;

  if (year && month) {
    startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  } else {
    const anchorDate = date ? new Date(date) : new Date();
    const y = anchorDate.getUTCFullYear();
    const m = anchorDate.getUTCMonth();

    startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  }

  const filter = {
    date: { $gte: startOfMonth, $lte: endOfMonth },
  };

  if (targetStudentIds.length > 0) {
    filter.student = targetStudentIds.length === 1 ? targetStudentIds[0] : { $in: targetStudentIds };
  }

  const records = await Attendance.find(filter);

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
  };

  records.forEach((rec) => {
    if (summary[rec.status] !== undefined) {
      summary[rec.status] += 1;
    }
  });

  return {
    summary,
    dateRange: {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    },
  };
};

module.exports = {
  markAttendance,
  getAttendanceHistory,
  getWeeklySummary,
  getMonthlySummary,
};

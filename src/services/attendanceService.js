const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

/**
 * Helper to get normalized UTC midnight date for today
 */
const getTodayMidnightUTC = () => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
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
    if (student.parent?.toString() !== user.user_id) {
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
 * 1. MARK SINGLE ATTENDANCE (Strictly creates new attendance for today)
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

  // 3. Verify teacher is authorized for student's class (admin bypasses check)
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

  // 4. Normalize date to midnight UTC (Today only)
  const recordDate = attendanceData.date ? new Date(attendanceData.date) : new Date();
  recordDate.setUTCHours(0, 0, 0, 0);

  // 5. Ensure record does not already exist (Separation of Mark and Update)
  const existingRecord = await Attendance.findOne({
    student: attendanceData.student,
    date: recordDate,
  });

  if (existingRecord) {
    throw new Error('Attendance has already been marked for this student today. Please use update endpoint to modify.');
  }

  // 6. Create attendance record
  let attendance = await Attendance.create({
    student: attendanceData.student,
    date: recordDate,
    status: attendanceData.status,
    markedBy: currentUser.user_id,
  });

  attendance = await attendance.populate([
    { path: 'student', select: 'name studentCode class' },
    { path: 'markedBy', select: 'name email' },
  ]);

  return { attendance };
};

/**
 * 2. BULK MARK ATTENDANCE (For an entire class, Today only)
 */
const bulkMarkAttendance = async (bulkData, currentUser) => {
  const { class: classId, records, date } = bulkData;

  // 1. Verify class exists
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error('Class not found');
  }

  // 2. Verify authorization
  if (currentUser.role !== 'admin') {
    const isTeacherInClass = classObj.teachers.some(
      (teacherId) => teacherId.toString() === currentUser.user_id
    );
    if (!isTeacherInClass) {
      throw new Error('You are not authorized to mark attendance for this class');
    }
  }

  // 3. Normalize date to midnight UTC
  const recordDate = date ? new Date(date) : new Date();
  recordDate.setUTCHours(0, 0, 0, 0);

  // 4. Validate all students belong to the class
  const classStudents = await Student.find({ class: classId });
  const classStudentMap = new Map(classStudents.map((s) => [s._id.toString(), s]));

  const savedRecords = [];

  for (const item of records) {
    const studentObj = classStudentMap.get(item.student);
    if (!studentObj) {
      throw new Error(`Student ${item.student} does not belong to this class`);
    }

    const attendance = await Attendance.findOneAndUpdate(
      { student: item.student, date: recordDate },
      {
        student: item.student,
        date: recordDate,
        status: item.status,
        markedBy: currentUser.user_id,
      },
      { new: true, upsert: true, runValidators: true }
    );

    savedRecords.push(attendance);
  }

  return {
    message: 'Bulk attendance recorded successfully',
    totalProcessed: savedRecords.length,
    class: { id: classObj._id, name: classObj.name },
    date: recordDate.toISOString().split('T')[0],
    records: savedRecords,
  };
};

/**
 * 3. UPDATE ATTENDANCE (By Record ID)
 */
const updateAttendance = async (id, updateData, currentUser) => {
  const attendance = await Attendance.findById(id).populate('student');
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  // Authorization check
  if (currentUser.role !== 'admin') {
    const classObj = await Class.findById(attendance.student.class);
    if (!classObj || !classObj.teachers.some((t) => t.toString() === currentUser.user_id)) {
      throw new Error('You are not authorized to update attendance for this student');
    }
  }

  attendance.status = updateData.status;
  attendance.markedBy = currentUser.user_id;
  await attendance.save();

  await attendance.populate([
    { path: 'student', select: 'name studentCode class' },
    { path: 'markedBy', select: 'name email' },
  ]);

  return { attendance };
};

/**
 * 4. DELETE ATTENDANCE (By Record ID)
 */
const deleteAttendance = async (id, currentUser) => {
  const attendance = await Attendance.findById(id).populate('student');
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  if (currentUser.role !== 'admin') {
    const classObj = await Class.findById(attendance.student.class);
    if (!classObj || !classObj.teachers.some((t) => t.toString() === currentUser.user_id)) {
      throw new Error('You are not authorized to delete attendance for this student');
    }
  }

  await Attendance.findByIdAndDelete(id);

  return { message: 'Attendance record deleted successfully' };
};

/**
 * 5. GET STUDENT ATTENDANCE (/attendance/student/:studentId)
 */
const getStudentAttendance = async (studentId, queryParams, currentUser) => {
  await validateUserAccessForStudent(studentId, currentUser);

  const student = await Student.findById(studentId).populate('class', 'name');
  const { startDate, endDate, status, page = 1, limit = 10 } = queryParams;

  const filter = { student: studentId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setUTCHours(0, 0, 0, 0);
      filter.date.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = e;
    }
  }

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const attendance = await Attendance.find(filter)
    .populate('markedBy', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Attendance.countDocuments(filter);

  return {
    student: {
      id: student._id,
      name: student.name,
      studentCode: student.studentCode,
      class: student.class,
    },
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
 * 6. GET CLASS ATTENDANCE (/attendance/class/:classId)
 */
const getClassAttendance = async (classId, queryParams, currentUser) => {
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error('Class not found');
  }

  if (currentUser.role === 'teacher') {
    const isTeacher = classObj.teachers.some((t) => t.toString() === currentUser.user_id);
    if (!isTeacher) {
      throw new Error('You are not authorized to view attendance for this class');
    }
  } else if (currentUser.role !== 'admin') {
    throw new Error('You are not authorized to view class attendance');
  }

  const classStudents = await Student.find({ class: classId });
  const studentIds = classStudents.map((s) => s._id);

  const { date, startDate, endDate, status, page = 1, limit = 20 } = queryParams;
  const filter = { student: { $in: studentIds } };

  if (date) {
    const dStart = new Date(date);
    dStart.setUTCHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: dStart, $lte: dEnd };
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setUTCHours(0, 0, 0, 0);
      filter.date.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = e;
    }
  }

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const attendance = await Attendance.find(filter)
    .populate('student', 'name studentCode')
    .populate('markedBy', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Attendance.countDocuments(filter);

  return {
    class: { id: classObj._id, name: classObj.name },
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
 * 7. GET TODAY'S ATTENDANCE FOR A CLASS (/attendance/today/:classId)
 */
const getTodayAttendance = async (classId, currentUser) => {
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error('Class not found');
  }

  if (currentUser.role === 'teacher') {
    const isTeacher = classObj.teachers.some((t) => t.toString() === currentUser.user_id);
    if (!isTeacher) {
      throw new Error('You are not authorized to view attendance for this class');
    }
  } else if (currentUser.role !== 'admin') {
    throw new Error('You are not authorized to view class attendance');
  }

  const todayStart = getTodayMidnightUTC();
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const students = await Student.find({ class: classId }).select('name studentCode');
  const attendanceRecords = await Attendance.find({
    student: { $in: students.map((s) => s._id) },
    date: { $gte: todayStart, $lte: todayEnd },
  }).populate('markedBy', 'name email');

  const attendanceMap = new Map(attendanceRecords.map((r) => [r.student.toString(), r]));

  const summary = {
    totalStudents: students.length,
    present: 0,
    absent: 0,
    late: 0,
    unmarked: 0,
  };

  const studentList = students.map((student) => {
    const record = attendanceMap.get(student._id.toString());
    const status = record ? record.status : 'unmarked';

    summary[status] = (summary[status] || 0) + 1;

    return {
      student: {
        id: student._id,
        name: student.name,
        studentCode: student.studentCode,
      },
      attendanceId: record ? record._id : null,
      status,
      markedBy: record?.markedBy || null,
      updatedAt: record?.updatedAt || null,
    };
  });

  return {
    class: { id: classObj._id, name: classObj.name },
    date: todayStart.toISOString().split('T')[0],
    summary,
    students: studentList,
  };
};

/**
 * 8. GET ATTENDANCE STATISTICS (/attendance/stats)
 */
const getAttendanceStats = async (queryParams, currentUser) => {
  const { class: classId, student: studentId, startDate, endDate } = queryParams;
  const filter = {};

  if (currentUser.role === 'parent') {
    const parentStudents = await Student.find({ parent: currentUser.user_id });
    const studentIds = parentStudents.map((s) => s._id);
    if (studentId) {
      if (!studentIds.some((s) => s.toString() === studentId)) {
        throw new Error('You are not authorized to view this student\'s stats');
      }
      filter.student = studentId;
    } else {
      filter.student = { $in: studentIds };
    }
  } else if (currentUser.role === 'teacher') {
    const teacherClasses = await Class.find({ teachers: { $in: [currentUser.user_id] } });
    const classIds = teacherClasses.map((c) => c._id);
    if (classId) {
      if (!classIds.some((c) => c.toString() === classId)) {
        throw new Error('You are not authorized to view stats for this class');
      }
      const students = await Student.find({ class: classId });
      filter.student = { $in: students.map((s) => s._id) };
    } else if (studentId) {
      const student = await Student.findById(studentId);
      if (!student || !classIds.some((c) => c.toString() === student.class?.toString())) {
        throw new Error('You are not authorized to view this student\'s stats');
      }
      filter.student = studentId;
    } else {
      const students = await Student.find({ class: { $in: classIds } });
      filter.student = { $in: students.map((s) => s._id) };
    }
  } else if (currentUser.role === 'admin') {
    if (classId) {
      const students = await Student.find({ class: classId });
      filter.student = { $in: students.map((s) => s._id) };
    } else if (studentId) {
      filter.student = studentId;
    }
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setUTCHours(0, 0, 0, 0);
      filter.date.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = e;
    }
  }

  const records = await Attendance.find(filter);
  const total = records.length;
  let present = 0;
  let absent = 0;
  let late = 0;

  records.forEach((rec) => {
    if (rec.status === 'present') present += 1;
    else if (rec.status === 'absent') absent += 1;
    else if (rec.status === 'late') late += 1;
  });

  const attendanceRate = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

  return {
    totalRecords: total,
    summary: {
      present,
      absent,
      late,
      attendanceRate: `${attendanceRate}%`,
    },
  };
};

/**
 * 9. RETRIEVE ATTENDANCE HISTORY / ABSENCE RECORDS
 */
const getAttendanceHistory = async (queryParams, user) => {
  const { student, class: classId, date, startDate, endDate, status, page = 1, limit = 10 } = queryParams;
  const filter = {};

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

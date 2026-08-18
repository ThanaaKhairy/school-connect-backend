const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const {sendWelcomeEmail} = require("./emailService")
// ==================== USER MANAGEMENT ====================

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already registered');
  }
   const plainPassword = userData.password;


  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    phone: userData.phone || '',
    isActive: true
  });

   try {
    await sendWelcomeEmail(
      user.email,
      user.name,
      plainPassword, 
      user.role
    );
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }
  return {
    user: {
      user_id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive
    }
  };
};

const getAllUsers = async (queryParams) => {
  const { role, isActive, search, page, limit } = queryParams;
  
  const skip = (page - 1) * limit;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password -isVerified -resetPasswordCode -resetPasswordExpiry')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -isVerified -resetPasswordCode -resetPasswordExpiry');
  
  if (!user) {
    throw new Error('User not found');
  }

  let additionalData = {};

  if (user.role === 'parent') {
    const students = await Student.find({ parent: userId })
      .populate('class', 'name');
    additionalData.students = students;
  } else if (user.role === 'teacher') {
    const classes = await Class.find({ teachers: { $in: [userId] } });
    additionalData.classes = classes;
  }

  return {
    user,
    ...additionalData
  };
};

const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Prevent email update
  delete updateData.email;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -isVerified -resetPasswordCode -resetPasswordExpiry');

  return { user: updatedUser };
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select('-password -isVerified -resetPasswordCode -resetPasswordExpiry');

  if (!user) {
    throw new Error('User not found');
  }

  return { user };
};

const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true }
  ).select('-password -isVerified -resetPasswordCode -resetPasswordExpiry');

  if (!user) {
    throw new Error('User not found');
  }

  return { user };
};

const hardDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Remove user from related entities
  if (user.role === 'parent') {
    await Student.updateMany(
      { parent: userId },
      { parent: null }
    );
  } else if (user.role === 'teacher') {
    await Class.updateMany(
      { teachers: userId },
      { $pull: { teachers: userId } }
    );
  }

  await User.findByIdAndDelete(userId);

  return { message: 'User permanently deleted successfully!' };
};

// ==================== STUDENT MANAGEMENT ====================

const createStudent = async (studentData) => {
  const existingStudent = await Student.findOne({ 
    studentCode: studentData.studentCode 
  });
  if (existingStudent) {
    throw new Error('Student code already exists');
  }

  const parent = await User.findById(studentData.parent);
  if (!parent) {
    throw new Error('Parent not found');
  }
  if (parent.role !== 'parent') {
    throw new Error('User must be a parent');
  }

  const classObj = await Class.findById(studentData.class);
  if (!classObj) {
    throw new Error('Class not found');
  }

  const student = new Student(studentData);
  await student.save();

  const populatedStudent = await Student.findById(student._id)
    .populate('parent', 'name email')
    .populate('class', 'name');

  return { student: populatedStudent };
};

const getAllStudents = async (queryParams) => {
  const { class: classId, parent, search, page = 1, limit = 10 } = queryParams;
  
  const skip = (page - 1) * limit;
  const filter = {};

  if (classId) filter.class = classId;
  if (parent) filter.parent = parent;
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const students = await Student.find(filter)
    .populate('parent', 'name email')
    .populate('class', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Student.countDocuments(filter);

  return {
    students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate('parent', 'name email phone')
    .populate('class', 'name');

  if (!student) {
    throw new Error('Student not found');
  }

  return { student };
};

// services/adminService.js

const updateStudent = async (studentId, updateData) => {
  // 1. Check if student exists
  const existingStudent = await Student.findById(studentId);
  if (!existingStudent) {
    throw new Error('Student not found');
  }

  // 2. If updating parent, verify parent exists and has role 'parent'
  if (updateData.parent) {
    const parent = await User.findById(updateData.parent);
    if (!parent) {
      throw new Error('Parent not found');
    }
    if (parent.role !== 'parent') {
      throw new Error('User must be a parent');
    }
  }

  // 3. If updating class, verify class exists
  if (updateData.class) {
    const classObj = await Class.findById(updateData.class);
    if (!classObj) {
      throw new Error('Class not found');
    }
  }

  // 4. Perform update
  const student = await Student.findByIdAndUpdate(
    studentId,
    updateData,
    { new: true, runValidators: true }
  ).populate('parent', 'name email')
   .populate('class', 'name');

  return { student };
};

const deleteStudent = async (studentId) => {
  const student = await Student.findByIdAndDelete(studentId);
  
  if (!student) {
    throw new Error('Student not found');
  }

  return { message: 'Student deleted successfully!' };
};

// ==================== CLASS MANAGEMENT ====================

const createClass = async (classData) => {
  // Validate all teachers exist and are actually teachers
  if (classData.teachers && classData.teachers.length > 0) {
    const teachers = await User.find({
      _id: { $in: classData.teachers },
      role: 'teacher'
    });
    
    if (teachers.length !== classData.teachers.length) {
      throw new Error('One or more teachers not found or not a teacher');
    }
  }

  const classObj = new Class(classData);
  await classObj.save();

  const populatedClass = await Class.findById(classObj._id)
    .populate('teachers', 'name email');

  return { class: populatedClass };
};

const getAllClasses = async (queryParams) => {
  const { teacher, search, page = 1, limit = 10 } = queryParams;
  
  const skip = (page - 1) * limit;
  const filter = {};

  if (teacher) filter.teachers = { $in: [teacher] };
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const classes = await Class.find(filter)
    .populate('teachers', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Class.countDocuments(filter);

  return {
    classes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getClassById = async (classId) => {
  const classObj = await Class.findById(classId)
    .populate('teachers', 'name email');

  if (!classObj) {
    throw new Error('Class not found');
  }

  const students = await Student.find({ class: classId })
    .populate('parent', 'name email');

  return {
    class: classObj,
    students
  };
};

const updateClass = async (classId, updateData) => {
  // Validate teachers if provided
  if (updateData.teachers && updateData.teachers.length > 0) {
    const teachers = await User.find({
      _id: { $in: updateData.teachers },
      role: 'teacher'
    });
    
    if (teachers.length !== updateData.teachers.length) {
      throw new Error('One or more teachers not found or not a teacher');
    }
  }

  const classObj = await Class.findByIdAndUpdate(
    classId,
    updateData,
    { new: true, runValidators: true }
  ).populate('teachers', 'name email');

  if (!classObj) {
    throw new Error('Class not found');
  }

  return { class: classObj };
};

const deleteClass = async (classId) => {
  const classObj = await Class.findById(classId);
  if (!classObj) {
    throw new Error('Class not found');
  }

  await Student.updateMany(
    { class: classId },
    { class: null }
  );

  await Class.findByIdAndDelete(classId);

  return { message: 'Class deleted successfully!' };
};


// const createFirstAdmin = async () => {
//   try {
//     const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.com';
//     const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

//     const existingAdmin = await User.findOne({ email: adminEmail });
//     if (existingAdmin) {
//       console.log('Admin already exists');
//       return;
//     }

//     const admin = await User.create({
//       name: 'Super Admin',
//       email: adminEmail,
//       password: adminPassword,
//       role: 'admin',
//       phone: '01006477676',
//       isActive: true
//     });

//     console.log('First admin created successfully');
    
//   } catch (error) {
//     console.error('Failed to create admin:', error.message);
//   }
// };

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
  // createFirstAdmin
};
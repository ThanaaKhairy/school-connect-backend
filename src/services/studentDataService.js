// services/studentDataService.js
const Student = require('../models/Student');
const Grade = require('../models/grade');
const Attendance = require('../models/Attendance');

async function getStudentReportData(studentId, startDate, endDate) {
  // Get student info
  const student = await Student.findById(studentId)
    .populate('parent', 'name email')
    .populate('class', 'name');

  if (!student) {
    throw new Error('Student not found');
  }

  // Get grades in date range
  const grades = await Grade.find({
    student: studentId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  // Get attendance in date range
  const attendance = await Attendance.find({
    student: studentId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  // Calculate stats
  const stats = calculateStats(grades, attendance);

  return { student, grades, attendance, stats };
}


//Calculate statistics

function calculateStats(grades, attendance) {
  // Grade stats
  const total = grades.length;
  let average = 0;
  let highest = 0;
  let lowest = 100;

  if (total > 0) {
    const scores = grades.map(g => (g.score / g.maxScore) * 100);
    average = scores.reduce((a, b) => a + b, 0) / total;
    highest = Math.max(...scores);
    lowest = Math.min(...scores);
  }

  // By subject
  const subjectMap = {};
  grades.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
    subjectMap[g.subject].push((g.score / g.maxScore) * 100);
  });

  const bySubject = Object.keys(subjectMap).map(subject => ({
    subject,
    average: subjectMap[subject].reduce((a, b) => a + b, 0) / subjectMap[subject].length
  }));

  // Attendance stats
  const totalDays = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const attendanceRate = totalDays > 0 ? ((present / totalDays) * 100).toFixed(2) : 0;

  return {
    grades: { total, average: average.toFixed(2), highest, lowest, bySubject },
    attendance: { totalDays, present, absent, late, attendanceRate: `${attendanceRate}%` }
  };
}

module.exports = { getStudentReportData };
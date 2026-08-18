const { generateStudentReport } = require('../services/reportService');
const { getStudentReportData } = require('../services/studentDataService');
const { sendReportEmail } = require('../services/emailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const Student = require('../models/Student');

const generateReport = async (req, res) => {
  try {
    const { studentId, period = 'monthly' } = req.body;

    //  Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return sendError(res, 'Student not found', 404);
    }

    //  Verify parent owns this student
    if (student.parent.toString() !== req.user.user_id) {
      return sendError(res, 'You can only generate reports for your children', 403);
    }

    //  Calculate date range
    const now = new Date();
    let startDate, endDate = now;
    
    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else { // monthly
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    // 4. Get student data
    const studentData = await getStudentReportData(studentId, startDate, endDate);

    // 5. Generate report with AI
    const report = await generateStudentReport(studentData, period);

      // 6. Send email
    await sendReportEmail(
      student.parent.email,
      student.name,
      period,
      report
    );

    sendSuccess(res, report, 'Report generated successfully and send to your email', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};


module.exports = { generateReport };
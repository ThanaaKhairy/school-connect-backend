const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


async function generateStudentReport(studentData, period) {
  const {
    student,
    grades,
    attendance,
    stats
  } = studentData;

  // Build simple prompt
  const prompt = `
    Generate a student progress report for ${period} period.

    STUDENT: ${student.name} (${student.studentCode})
    CLASS: ${student.class?.name || 'N/A'}

    GRADES SUMMARY:
    - Average: ${stats.grades.average}%
    - Total Grades: ${stats.grades.total}
    - Highest: ${stats.grades.highest}%
    - Lowest: ${stats.grades.lowest}%

    GRADES BY SUBJECT:
    ${stats.grades.bySubject.map(s => 
      `- ${s.subject}: ${s.average}%`
    ).join('\n')}

    ATTENDANCE:
    - Rate: ${stats.attendance.attendanceRate}
    - Present: ${stats.attendance.present} days
    - Absent: ${stats.attendance.absent} days
    - Late: ${stats.attendance.late} days

    Based on this data, provide a JSON report with:
    1. overview (summary paragraph)
    2. strengths (array of strengths)
    3. improvements (array of areas to improve)
    4. recommendations (array of recommendations)
    5. overallStatus (Excellent, Good, Average, Needs Improvement)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `You are an educational report writer. 
        Provide clear, encouraging, and professional feedback.
        Always be positive and constructive.
        Response must be valid JSON.`,
      responseMimeType: "application/json",
    },
  });

  // Parse the JSON response
  const report = JSON.parse(response.text);

  // Add extra data to the report
  return {
    student: {
      name: student.name,
      code: student.studentCode,
      class: student.class?.name,
    },
    period: period,
    stats: {
      average: stats.grades.average,
      attendance: stats.attendance.attendanceRate,
    },
    ...report,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateStudentReport };
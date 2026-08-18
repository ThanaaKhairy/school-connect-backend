const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (email ,subject ,content) => {
  const mailOptions = {
    from: `"School" <${process.env.ADMIN_EMAIL}>`,
    to: email,
    subject ,
    html: content
  };

  await transporter.sendMail(mailOptions);
};


const sendWelcomeEmail = async (email, name, password, role) => {
  const subject = '🎓 Welcome to School Connect - Your Account is Ready!';
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <style>
        /* Reset & Base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          background: #f5f7fa;
          padding: 20px;
          color: #1e293b;
        }
        .container {
          max-width: 480px;
          margin: 0 auto;
        }
        
        /* Card */
        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 36px 32px 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid #eef2f6;
        }
        
        /* Header */
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .logo span {
          color: #4f46e5;
        }
        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        /* Divider */
        .hr {
          height: 1px;
          background: #eef2f6;
          margin: 18px 0;
        }
        
        /* Greeting */
        .greeting {
          font-size: 16px;
          font-weight: 500;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .greeting span {
          color: #4f46e5;
        }
        .message {
          color: #475569;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        /* Credentials */
        .credential {
          display: flex;
          align-items: center;
          padding: 6px 0;
          font-size: 14px;
        }
        .credential .label {
          color: #94a3b8;
          min-width: 72px;
          font-weight: 400;
        }
        .credential .value {
          color: #0f172a;
          font-weight: 500;
          word-break: break-all;
        }
        .credential .badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 0 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
        }
        
        /* Button */
        .btn-wrap {
          text-align: center;
          margin: 24px 0 18px;
        }
        .btn {
          display: inline-block;
          background: #4f46e5;
          color: #ffffff !important;
          padding: 10px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #4338ca;
        }
        
        /* Note */
        .note {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
          border-left: 3px solid #e2e8f0;
          margin: 16px 0 4px;
        }
        .note strong {
          color: #334155;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          font-size: 12px;
          color: #c7d1dd;
          margin-top: 18px;
        }
        .footer a {
          color: #94a3b8;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <!-- Logo -->
          <div class="logo">📚 School<span>Connect</span></div>
          <div class="subtitle">Your School Communication Hub</div>

          <div class="hr"></div>

          <!-- Greeting -->
          <div class="greeting">Hello, <span>${name}</span> 👋</div>
          <p class="message">
            Your account has been created. You can now access all features.
          </p>

          <!-- Credentials -->
          <div class="credential">
            <span class="label">Email</span>
            <span class="value">${email}</span>
          </div>
          <div class="credential">
            <span class="label">Password</span>
            <span class="value">${password}</span>
          </div>
          <div class="credential">
            <span class="label">Role</span>
            <span class="badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
          </div>

          <div class="hr"></div>
          <!-- Note -->
          <div class="note">
            🔐 <strong>Tip:</strong> Change your password after first login for better security.
          </div>

          <!-- Footer -->
          <div class="footer">
            © ${new Date().getFullYear()} School Connect &middot; Automated message
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, content);
};


// Send Password Reset OTP Email
const sendPasswordResetEmail = async (email, name, resetCode) => {
  const subject = '🔐 Password Reset Code - School Connect';
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 480px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
        .card { background: #ffffff; border-radius: 16px; padding: 32px 28px; border: 1px solid #eef2f6; }
        .logo { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .logo span { color: #4f46e5; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .hr { height: 1px; background: #eef2f6; margin: 18px 0; }
        .greeting { font-size: 16px; font-weight: 500; color: #0f172a; margin-bottom: 6px; }
        .greeting span { color: #4f46e5; }
        .message { color: #475569; font-size: 14px; margin-bottom: 20px; }
        .code-box { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; font-family: monospace; }
        .note { background: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #64748b; border-left: 3px solid #e2e8f0; margin: 16px 0 4px; }
        .note strong { color: #334155; }
        .footer { text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 18px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">📚 School<span>Connect</span></div>
        <div class="subtitle">Password Reset Request</div>
        <div class="hr"></div>
        <div class="greeting">Hello, <span>${name}</span> 👋</div>
        <p class="message">
          We received a request to reset your password. Use the code below to verify your identity.
        </p>
        <div class="code-box">
          <div class="code">${resetCode}</div>
        </div>
        <div class="note">
          ⏳ This code will expire in <strong>2 minutes</strong>.
          If you didn't request this, you can safely ignore this email.
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} School Connect &middot; Automated message
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, content);
};

// Send Password Changed Confirmation Email
const sendPasswordChangedEmail = async (email, name) => {
  const subject = '✅ Password Changed - School Connect';
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 480px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
        .card { background: #ffffff; border-radius: 16px; padding: 32px 28px; border: 1px solid #eef2f6; }
        .logo { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .logo span { color: #4f46e5; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .hr { height: 1px; background: #eef2f6; margin: 18px 0; }
        .greeting { font-size: 16px; font-weight: 500; color: #0f172a; margin-bottom: 6px; }
        .greeting span { color: #4f46e5; }
        .message { color: #475569; font-size: 14px; margin-bottom: 20px; }
        .note { background: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #64748b; border-left: 3px solid #22c55e; margin: 16px 0 4px; }
        .note strong { color: #334155; }
        .footer { text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 18px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">📚 School<span>Connect</span></div>
        <div class="subtitle">Password Updated</div>
        <div class="hr"></div>
        <div class="greeting">Hello, <span>${name}</span> 👋</div>
        <p class="message">
          Your password has been changed successfully. If you didn't make this change, please contact support immediately.
        </p>
        <div class="note">
          ✅ Your account is secure. Contact support if you need any help.
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} School Connect &middot; Automated message
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, content);
};



const sendReportEmail = async (email, studentName, period, reportData) => {
  const subject = `📊 Student Progress Report - ${studentName} (${period})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Progress Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f7fa;
        }
        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px 28px;
          border: 1px solid #eef2f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }
        .logo span {
          color: #4f46e5;
        }
        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin-top: 4px;
        }
        .divider {
          height: 1px;
          background: #eef2f6;
          margin: 20px 0;
        }
        .student-info {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .student-info p {
          margin: 4px 0;
          font-size: 14px;
        }
        .student-info .label {
          color: #94a3b8;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0;
        }
        .stat-box {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-box .number {
          font-size: 24px;
          font-weight: 700;
          color: #4f46e5;
        }
        .stat-box .label {
          font-size: 12px;
          color: #94a3b8;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 20px 0 12px;
        }
        .overview-text {
          color: #475569;
          font-size: 14px;
          line-height: 1.8;
        }
        .list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .list li {
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #334155;
        }
        .list li:last-child {
          border-bottom: none;
        }
        .list li .icon {
          margin-right: 8px;
        }
        .list li .icon.green { color: #22c55e; }
        .list li .icon.blue { color: #3b82f6; }
        .list li .icon.orange { color: #f59e0b; }
        .status-badge {
          display: inline-block;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .status-badge.excellent { background: #dcfce7; color: #166534; }
        .status-badge.good { background: #dbeafe; color: #1e40af; }
        .status-badge.average { background: #fef3c7; color: #92400e; }
        .status-badge.needs-improvement { background: #fee2e2; color: #991b1b; }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eef2f6;
        }
        .btn {
          display: inline-block;
          background: #4f46e5;
          color: #ffffff !important;
          padding: 10px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          margin-top: 16px;
        }
        .btn:hover {
          background: #4338ca;
        }
        .note {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
          margin: 16px 0 4px;
          border-left: 3px solid #e2e8f0;
        }
        .note strong {
          color: #334155;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <!-- Header -->
        <div class="header">
          <div class="logo">📚 School<span>Connect</span></div>
          <div class="subtitle">Student Progress Report</div>
        </div>

        <div class="divider"></div>

        <!-- Student Info -->
        <div class="student-info">
          <p><span class="label">Student:</span> <strong>${studentName}</strong></p>
          <p><span class="label">Period:</span> ${period}</p>
          <p><span class="label">Generated:</span> ${new Date().toLocaleString()}</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-box">
            <div class="number">${reportData.stats.average || 'N/A'}</div>
            <div class="label">Average Grade</div>
          </div>
          <div class="stat-box">
            <div class="number">${reportData.stats.attendance || 'N/A'}</div>
            <div class="label">Attendance Rate</div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Overview -->
        <h3 class="section-title">📋 Overview</h3>
        <p class="overview-text">${reportData.overview || 'No overview available.'}</p>

        <!-- Strengths -->
        <h3 class="section-title">✅ Strengths</h3>
        <ul class="list">
          ${reportData.strengths?.length ? 
            reportData.strengths.map(s => `<li><span class="icon green">✓</span> ${s}</li>`).join('') :
            '<li>No strengths recorded yet.</li>'
          }
        </ul>

        <!-- Areas for Improvement -->
        <h3 class="section-title">📌 Areas for Improvement</h3>
        <ul class="list">
          ${reportData.improvements?.length ?
            reportData.improvements.map(i => `<li><span class="icon orange">•</span> ${i}</li>`).join('') :
            '<li>No areas for improvement identified.</li>'
          }
        </ul>

        <!-- Recommendations -->
        <h3 class="section-title">💡 Recommendations</h3>
        <ul class="list">
          ${reportData.recommendations?.length ?
            reportData.recommendations.map(r => `<li><span class="icon blue">→</span> ${r}</li>`).join('') :
            '<li>No recommendations available.</li>'
          }
        </ul>

        <div class="divider"></div>

        <!-- Overall Status -->
        <div style="text-align: center;">
          <p style="margin-bottom: 8px; color: #64748b; font-size: 14px;">Overall Status</p>
          <span class="status-badge ${reportData.overallStatus?.toLowerCase().replace(' ', '-') || 'average'}">
            ${reportData.overallStatus || 'Average'}
          </span>
        </div>

        <!-- Note -->
        <div class="note">
          💡 <strong>Tip:</strong> This report is AI-generated based on the student's grades and attendance data.
          For more details, please contact your child's teacher.
        </div>

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
            View Full Dashboard
          </a>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} School Connect — All rights reserved.</p>
          <p>This is an automated report. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, htmlContent);
};


module.exports = { sendEmail, sendWelcomeEmail , sendPasswordChangedEmail , sendPasswordResetEmail  , sendReportEmail};
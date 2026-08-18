const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
// const { createFirstAdmin } = require('./services/adminService');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const gradeRoutes = require('./routes/gradeRoutes'); 

const app = express();

// Database connection
connectDB();

// create the admin at the first time
// createFirstAdmin()

// Middlewares

// CORS
app.use(cors());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Check APP
app.get("/", (req, res) => {
  res.send("<h1>Welcome to School Communication System</h1>");
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/grades', gradeRoutes); 

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
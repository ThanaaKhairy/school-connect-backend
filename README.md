# 📚 School Connect — Backend API

School Connect is a school management backend that connects **Admins**, **Teachers**, and **Parents** in one platform. It handles authentication, user & student management, classes, announcements, assignments, attendance, grades, real-time notifications, and AI-generated student progress reports (emailed automatically to parents).

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Auth** | JWT-based login, logout, forgot/reset password (OTP), change password |
| 👤 **Users** | Admin creates/manages Admins, Teachers, and Parents |
| 🎓 **Students** | Create, update, list, and delete students; linked to a parent and a class |
| 🏫 **Classes** | Create and manage classes, assign teachers |
| 📢 **Announcements** | Admins/Teachers post announcements; parents get notified automatically |
| 🔔 **Notifications** | Per-user notification feed (read/unread, mark as read, delete) |
| 📝 **Assignments** | Teachers create assignments per class; parents/students are notified |
| 📋 **Attendance** | Daily attendance (single or bulk), stats, and history per student/class |
| 📊 **Grades** | Record grades per subject/term, subject averages, progress tracking |
| 🧾 **AI Reports** | Parents generate an AI-written (Google Gemini) progress report for their child, emailed automatically |


---

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Tokens (JWT)
- **Validation:** Zod
- **Email:** Nodemailer (credentials/OTP/report emails)
- **AI:** Google Gemini API (`@google/genai`) for AI-generated student reports

---

## ✅ Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A MongoDB database — either:
  - a local MongoDB instance, or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A Gmail account (or other SMTP provider) with an **App Password** for sending emails
- A [Google Gemini API key](https://ai.google.dev/) for the AI report feature

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd school-connect-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root (copy from `.env.example` below) and fill in your own values.

### 4. Run the server

**Development mode** (auto-restarts on file changes with nodemon):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

By default the server starts on the port defined in your `.env` file (`PORT`), e.g.:
```
http://localhost:5000/api
```
---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the project root with the following keys:

```dotenv
# Server
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
DATABASE_NAME=school_connect

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development

# Admin data
ADMIN_EMAIL=admin@school.com
EMAIL_PASSWORD=your_email_app_password
ADMIN_PASSWORD=admin123456

GEMINI_API_KEY=your_google_gemini_api_key
```

### Variable reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Port the Express server listens on (e.g. `5000`) |
| `MONGODB_URI` | ✅ | MongoDB connection string (local or Atlas), without the database name |
| `DATABASE_NAME` | ✅ | Name of the main MongoDB database used by the app |
| `JWT_SECRET` | ✅ | Secret key used to sign and verify JWT tokens — use a long, random string |
| `JWT_EXPIRES_IN` | ✅ | JWT token lifetime (e.g. `7d`, `1h`, `30m`) |
| `NODE_ENV` | ✅ | Environment mode: `development`, `production`, or `test` |
| `ADMIN_EMAIL` | ✅ | Email address used as the sender for system emails and as the default Admin account email |
| `EMAIL_PASSWORD` | ✅ | App password for `ADMIN_EMAIL`, used by Nodemailer to send OTPs, credentials, and reports |
| `ADMIN_PASSWORD` | ✅ | Password assigned to the default seeded Admin account |
| `GEMINI_API_KEY` | ✅ | API key for Google Gemini, used to generate AI student progress reports |

> ⚠️ Never commit your real `.env` file to version control. Keep only `.env.example` (with placeholder values) in the repository.


---

## 📖 API Documentation

- **Base URL:** `https://school-connect-backend-one.vercel.app`
- All API routes are prefixed with `/api` (e.g. `/api/auth/login`, `/api/grades`)
- All protected routes require the header: `Authorization: Bearer <token>`

---

## 👥 Development Team

| Name | Module Responsibility |
|---|---|
| Thanaa Khairy Sayed | Authentication & Users |
| Mahmoud Elsayed Ahmed | Assignments |
| Miriam George Wagih | Grades & Reports |
| Ziad Ahmed Said | Attendance |
| Shrouk Shaker Abdel Shafy | Announcements & Notifications |

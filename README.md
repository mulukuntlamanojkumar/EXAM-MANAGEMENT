# 📚 Exam Management System

A complete, modern, full-stack **Exam Management System** built for schools, colleges, universities, and coaching institutes.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| **Backend** | Java 21, Spring Boot 3.3, Spring Security, JWT |
| **Database** | MongoDB 7 (local) |
| **Auth** | JWT Bearer tokens, BCrypt password hashing |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Java JDK** | 21 LTS | https://adoptium.net |
| **Apache Maven** | 3.9+ | https://maven.apache.org |
| **Node.js** | 20.x LTS | https://nodejs.org |
| **MongoDB** | 7.0 | https://www.mongodb.com/try/download/community |

---

## 🚀 Quick Start

### Option A — Use the Startup Scripts (Windows)

Open **three separate terminals** and run one script in each:

```bat
REM Terminal 1 — Start MongoDB
start-mongodb.bat

REM Terminal 2 — Start Backend (wait for MongoDB first)
start-backend.bat

REM Terminal 3 — Start Frontend
start-frontend.bat
```

Then open your browser at **http://localhost:5173**

---

### Option B — Manual Startup

#### 1. Start MongoDB

```powershell
# Replace <your-home> with your actual home directory
& "C:\Users\<your-home>\mongodb\bin\mongod.exe" --dbpath "C:\Users\<your-home>\mongodb\data" --port 27017 --bind_ip 127.0.0.1
```

#### 2. Start the Backend

```powershell
cd c:\EXAM-MANAGMENT\backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080** (API base: `http://localhost:8080/api`)

#### 3. Start the Frontend

```powershell
cd c:\EXAM-MANAGMENT\frontend
npm install   # only needed once
npm run dev
```

The frontend starts on **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| **Admin** | `admin` | `Admin@123` | `/admin/dashboard` |
| **Examiner** | `examiner` | `Teacher@123` | `/examiner/dashboard` |
| **Student** | `student` | `Student@123` | `/student/dashboard` |

> 💡 The Login page also has **Quick Login** buttons to log in with one click.

---

## 🗂️ Project Structure

```
EXAM-MANAGMENT/
├── backend/                   # Spring Boot 3 application
│   ├── src/main/java/com/exammanagement/
│   │   ├── config/            # SecurityConfig, DataInitializer
│   │   ├── controller/        # REST controllers (Admin, Examiner, Student, Auth, Public)
│   │   ├── dto/               # Request and Response DTOs
│   │   ├── exception/         # Global exception handler
│   │   ├── model/             # MongoDB document models
│   │   ├── repository/        # Spring Data MongoDB repositories
│   │   ├── security/          # JWT, UserDetails, Filters
│   │   └── service/           # Business logic (interface + impl)
│   └── src/main/resources/
│       └── application.yml    # App configuration
│
├── frontend/                  # React 18 + Vite 5 application
│   ├── src/
│   │   ├── api/               # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── common/        # Reusable UI: Navbar, Sidebar, Modal, Table, etc.
│   │   │   └── layout/        # AppLayout wrapper
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── admin/         # 9 admin pages
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── examiner/      # Examiner dashboard & submissions
│   │   │   └── student/       # Student dashboard, exam-taking, results
│   │   └── routes/            # AppRoutes with ProtectedRoute guards
│   └── vite.config.js         # Vite config + proxy to backend
│
├── README.md                  # This file
├── start-mongodb.bat          # MongoDB startup script
├── start-backend.bat          # Backend startup script
└── start-frontend.bat         # Frontend startup script
```

---

## 🌟 Features

### 👑 Admin
- **Dashboard** — statistics cards, department distribution chart, recent activity
- **User Management** — create/edit/disable Admin, Examiner, Student accounts
- **Academic Management** — manage Departments and Subjects
- **Question Bank** — full-featured question editor (MCQ Single/Multiple, True/False, Short Answer, Descriptive)
- **Exam Management** — create, assemble, schedule, publish, and cancel exams; assign examiners; enroll students
- **Submissions** — view all student submissions with per-question score breakdown
- **Reports & Analytics** — grade distribution charts, CSV/JSON export
- **Announcements** — post/delete system-wide notices shown in the navbar
- **Audit Logs** — tamper-evident action log for all key operations

### 📝 Examiner / Teacher
- **Dashboard** — overview of assigned exams
- **Question Creation** — create questions for subjects they teach
- **Submissions** — review student answers, manually grade descriptive questions

### 🎓 Student
- **Dashboard** — browse available exams and view past results
- **Exam Taking** — fullscreen exam interface with:
  - Live countdown timer
  - Question navigation palette (answered/flagged/unanswered)
  - Auto-save answers every time you select an option
  - Tab-switch proctoring detection with warnings
  - Submit confirmation dialog
- **Results** — detailed scorecard with per-question breakdown and confetti on pass 🎉

---

## 🔌 REST API Reference

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/register` | Public | Register new account |
| GET | `/api/auth/me` | Any auth | Get current user profile |
| POST | `/api/auth/change-password` | Any auth | Change password |

### Public
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/public/health` | Public | Health check |
| GET | `/api/public/announcements` | Public | Active announcements |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/users` | List all users / Create user |
| GET/PUT/DELETE | `/api/admin/users/{id}` | Get / Update / Delete user |
| PATCH | `/api/admin/users/{id}/toggle-status` | Enable/disable account |
| GET/POST | `/api/admin/departments` | List / Create departments |
| GET/POST | `/api/admin/subjects` | List / Create subjects |
| GET/POST | `/api/admin/questions` | List / Create questions |
| GET/POST | `/api/admin/exams` | List / Create exams |
| PUT | `/api/admin/exams/{id}` | Update exam |
| POST | `/api/admin/exams/{id}/publish` | Publish exam |
| POST | `/api/admin/exams/{id}/cancel` | Cancel exam |
| POST | `/api/admin/exams/{id}/enroll` | Enroll students |
| POST | `/api/admin/exams/{id}/assign-examiners` | Assign examiners |
| GET | `/api/admin/submissions` | All submissions |
| GET | `/api/admin/analytics/dashboard` | Dashboard stats |
| GET/POST | `/api/admin/announcements` | List / Create announcements |
| GET | `/api/admin/audit-logs` | View audit logs |

### Examiner
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/examiner/exams` | Assigned exams |
| GET | `/api/examiner/questions` | Own questions |
| GET | `/api/examiner/submissions` | Exam submissions |
| POST | `/api/examiner/submissions/{id}/grade` | Manual grade |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/exams` | Available exams |
| POST | `/api/student/exams/{id}/start` | Start/resume exam |
| POST | `/api/student/submissions/{id}/save-answer` | Save answer |
| POST | `/api/student/submissions/{id}/proctor-event` | Log proctor event |
| POST | `/api/student/submissions/{id}/submit` | Submit exam |
| GET | `/api/student/submissions/{id}/result` | View result |

---

## ⚙️ Configuration

Backend configuration is in [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml):

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/exam_management

app:
  jwt:
    secret: your-256-bit-secret-key-here
    expiration: 86400000   # 24 hours in ms
  seed-data: true          # set false after first run
  cors:
    allowed-origins: http://localhost:5173
```

---

## 🧪 Running Tests

```powershell
cd c:\EXAM-MANAGMENT\backend
mvn test
```

Tests included:
- `AuthServiceTest` — login success, duplicate username rejection
- `ExamSubmissionServiceTest` — full-score pass, wrong-answer negative marking

---

## 🚢 Production Deployment

### Frontend → Vercel / Netlify
```bash
npm run build          # outputs to dist/
# Upload dist/ to Vercel or Netlify
# Set VITE_API_URL env var to your backend URL
```

### Backend → Railway / Render
1. Push `backend/` to GitHub
2. Connect to Railway/Render, select Maven project
3. Set environment variables:
   - `SPRING_DATA_MONGODB_URI` → MongoDB Atlas URI
   - `APP_JWT_SECRET` → secure random string (32+ chars)
4. Deploy

### Database → MongoDB Atlas
1. Create a free M0 cluster at https://cloud.mongodb.com
2. Create a database user and whitelist your backend IP
3. Copy the connection string and set it in your backend env vars

---

## 📄 License

MIT License — free to use, modify, and distribute.

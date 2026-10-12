import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManager } from '../pages/admin/UserManager';
import { AcademicManager } from '../pages/admin/AcademicManager';
import { ExamManager } from '../pages/admin/ExamManager';
import { QuestionBank } from '../pages/admin/QuestionBank';
import { SubmissionsManager } from '../pages/admin/SubmissionsManager';
import { ReportsAnalytics } from '../pages/admin/ReportsAnalytics';
import { AnnouncementsManager } from '../pages/admin/AnnouncementsManager';
import { AuditLogs } from '../pages/admin/AuditLogs';

// Examiner Pages
import { ExaminerDashboard } from '../pages/examiner/ExaminerDashboard';
import { ExaminerExams } from '../pages/examiner/ExaminerExams';
import { ExaminerSubmissions } from '../pages/examiner/ExaminerSubmissions';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { TakeExam } from '../pages/student/TakeExam';
import { ExamResultView } from '../pages/student/ExamResultView';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Root Redirect Handler
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'ROLE_EXAMINER') return <Navigate to="/examiner/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Standalone Fullscreen Exam Taking Mode */}
      <Route
        path="/student/exam/:examId"
        element={
          <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
            <TakeExam />
          </ProtectedRoute>
        }
      />

      {/* Standalone Result Mode */}
      <Route
        path="/student/result/:submissionId"
        element={
          <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN', 'ROLE_EXAMINER']}>
            <ExamResultView />
          </ProtectedRoute>
        }
      />

      {/* Dashboard & Workspace Routes inside AppLayout */}
      <Route element={<AppLayout />}>
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UserManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academics"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AcademicManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <ExamManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <QuestionBank isExaminer={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <SubmissionsManager isExaminer={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <ReportsAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AnnouncementsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* Examiner Routes */}
        <Route
          path="/examiner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_EXAMINER', 'ROLE_ADMIN']}>
              <ExaminerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examiner/exams"
          element={
            <ProtectedRoute allowedRoles={['ROLE_EXAMINER', 'ROLE_ADMIN']}>
              <ExaminerExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examiner/questions"
          element={
            <ProtectedRoute allowedRoles={['ROLE_EXAMINER', 'ROLE_ADMIN']}>
              <QuestionBank isExaminer={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examiner/submissions"
          element={
            <ProtectedRoute allowedRoles={['ROLE_EXAMINER', 'ROLE_ADMIN']}>
              <ExaminerSubmissions />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submissions"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default Root Redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

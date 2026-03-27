/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageAssignments from './pages/admin/ManageAssignments';
import StudentDashboard from './pages/student/StudentDashboard';
import Assignments from './pages/student/Assignments';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login isAdminLogin={true} />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="assignments" element={<ManageAssignments />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
          <Toaster theme="dark" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

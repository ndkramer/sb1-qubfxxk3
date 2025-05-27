import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/authContext';
import { AdminAuthProvider, useAdminAuth } from './utils/adminAuthContext';
import { ClassProvider } from './utils/classContext';
import { ModuleProvider } from './utils/moduleContext';
import { NoteProvider } from './utils/noteContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ClassList from './pages/ClassList';
import ClassDetail from './pages/ClassDetail';
import ModuleDetail from './pages/ModuleDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  return <>{children}</>;
};

const AdminRoutes = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={
        <AdminProtectedRoute>
          <AdminLayout>
            <div>Admin Dashboard</div>
          </AdminLayout>
        </AdminProtectedRoute>
      } />
      <Route path="*" element={
        <AdminProtectedRoute>
          <Navigate to="/admin/dashboard\" replace />
        </AdminProtectedRoute>
      } />
    </Routes>
  </AdminAuthProvider>
);

const StudentRoutes = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Outlet />
          </Layout>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard\" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/:classId" element={<ClassDetail />} />
        <Route path="classes/:classId/modules/:moduleId" element={<ModuleDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard\" replace />
        </ProtectedRoute>
      } />
    </Routes>
  </AuthProvider>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={
          <ClassProvider>
            <ModuleProvider>
              <NoteProvider>
                <StudentRoutes />
              </NoteProvider>
            </ModuleProvider>
          </ClassProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
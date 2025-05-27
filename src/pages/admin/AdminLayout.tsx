import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../utils/adminAuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminLayout;
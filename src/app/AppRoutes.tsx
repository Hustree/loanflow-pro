import { CircularProgress, Box } from '@mui/material';
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import {
  DeviceManagementPage,
  LoginPage,
  PasskeyLoginPage,
  PasskeyRegisterPage,
  PasskeySetupPage,
  useAuth,
} from '@/features/auth';
import { LoanApplicationPage } from '@/features/loan-application';
import { DashboardPage, LoanManagementPage } from '@/features/loan-management';

// Protected Route component
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = user !== null || sessionStorage.getItem('isAuthenticated') === 'true';

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = user !== null || sessionStorage.getItem('isAuthenticated') === 'true';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/passkey" element={<PasskeyLoginPage />} />
      <Route path="/register" element={<PasskeyRegisterPage />} />
      <Route path="/passkey/setup" element={<PasskeySetupPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/loan" element={<LoanApplicationPage />} />
        <Route path="/manage" element={<LoanManagementPage />} />
        <Route path="/settings/devices" element={<DeviceManagementPage />} />
      </Route>

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login/passkey'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login/passkey'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;

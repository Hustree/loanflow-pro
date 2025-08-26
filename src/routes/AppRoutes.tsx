import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import LoanApplication from '../pages/LoanApplication';
import LoanManagement from '../pages/LoanManagement';
import Dashboard from '../pages/Dashboard';
import ReduxDemo from '../pages/ReduxDemo';
import PasskeyLoginPage from '../pages/PasskeyLoginPage';
import PasskeyRegisterPage from '../pages/PasskeyRegisterPage';
import PasskeySetupPage from '../pages/PasskeySetupPage';
import DeviceManagementPage from '../pages/DeviceManagementPage';
import { CircularProgress, Box } from '@mui/material';

// Protected Route component
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = user !== null || sessionStorage.getItem('isAuthenticated') === 'true';
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
      <Route path="/login" element={<Login />} />
      <Route path="/login/passkey" element={<PasskeyLoginPage />} />
      <Route path="/register" element={<PasskeyRegisterPage />} />
      <Route path="/passkey/setup" element={<PasskeySetupPage />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loan" element={<LoanApplication />} />
        <Route path="/manage" element={<LoanManagement />} />
        <Route path="/redux-demo" element={<ReduxDemo />} />
        <Route path="/settings/devices" element={<DeviceManagementPage />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login/passkey"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login/passkey"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
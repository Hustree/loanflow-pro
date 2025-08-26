import React from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DeviceManagement } from '../components/auth/DeviceManagement';

const DeviceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header with back button */}
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your passkey devices and authentication preferences
          </Typography>
        </Box>

        {/* Device Management Component */}
        <DeviceManagement
          userEmail={user.email || ''}
          userName={user.displayName || user.email?.split('@')[0] || 'User'}
        />
      </Stack>
    </Container>
  );
};

export default DeviceManagementPage;
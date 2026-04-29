import { Alert, Container } from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PasskeyRegistration } from './PasskeyRegistration';

const PasskeySetupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from navigation state or use defaults
  const { email, displayName } = location.state || {
    email: 'user@example.com',
    displayName: 'User',
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }} data-testid="passkey-demo-banner">
        This is a simulated passkey flow. Your credential is stored locally in this browser only —
        nothing is sent to a real server.
      </Alert>
      <PasskeyRegistration
        email={email}
        displayName={displayName}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </Container>
  );
};

export default PasskeySetupPage;

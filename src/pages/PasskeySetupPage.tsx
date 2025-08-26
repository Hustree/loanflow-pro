import React from 'react';
import { Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { PasskeyRegistration } from '../components/auth/PasskeyRegistration';

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
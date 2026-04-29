import { Alert, Container } from '@mui/material';
import React from 'react';

import { PasskeyLogin } from './PasskeyLogin';

const PasskeyLoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Alert severity="info" sx={{ mb: 3 }} data-testid="passkey-demo-banner">
        This is a simulated passkey flow. Your credential is stored locally in this browser only —
        nothing is sent to a real server.
      </Alert>
      <PasskeyLogin />
    </Container>
  );
};

export default PasskeyLoginPage;

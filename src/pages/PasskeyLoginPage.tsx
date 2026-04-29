import { Container } from '@mui/material';
import React from 'react';

import { PasskeyLogin } from '../components/auth/PasskeyLogin';

const PasskeyLoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <PasskeyLogin />
    </Container>
  );
};

export default PasskeyLoginPage;

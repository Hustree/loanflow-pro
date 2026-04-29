import { AccountCircle, Lock, Fingerprint, PlayArrow } from '@mui/icons-material';
import { Container, Box, Paper, Typography, Button, Alert, Divider } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import TextInput from '@/components/TextInput';
import { STATIC_CREDENTIALS } from '@/utils/constants';
import { validateLoginForm } from '@/utils/validators';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setLoginError('');
  };

  const submit = (username: string, password: string) => {
    // Validate form
    const validationErrors = validateLoginForm(username, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check credentials
    if (username === STATIC_CREDENTIALS.username && password === STATIC_CREDENTIALS.password) {
      // Store auth state in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('username', username);

      // Navigate to loan page
      navigate('/loan');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(formData.username, formData.password);
  };

  const handleTryDemo = () => {
    setErrors({});
    setLoginError('');
    setFormData({
      username: STATIC_CREDENTIALS.username,
      password: STATIC_CREDENTIALS.password,
    });
    submit(STATIC_CREDENTIALS.username, STATIC_CREDENTIALS.password);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountCircle sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5">
              LoanFlow Pro
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to continue
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            onClick={handleTryDemo}
            data-testid="try-demo-button"
            startIcon={<PlayArrow />}
            sx={{ mb: 2, py: 1.5 }}
          >
            Try the demo (no signup)
          </Button>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              required
            />

            <TextInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              startIcon={<Lock />}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2, py: 1.5 }}
              startIcon={<Fingerprint />}
              component={Link}
              to="/login/passkey"
            >
              Sign In with Passkey
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ display: 'block', mt: 1, opacity: 0.7 }}
            >
              Demo credentials: demo / demo
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

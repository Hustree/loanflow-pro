import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import { AccountCircle, Lock, Fingerprint } from '@mui/icons-material';
import TextInput from '../components/inputs/TextInput';
import { validateLoginForm } from '../utils/validators';
import { STATIC_CREDENTIALS } from '../utils/constants';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateLoginForm(formData.username, formData.password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check credentials
    if (
      formData.username === STATIC_CREDENTIALS.username &&
      formData.password === STATIC_CREDENTIALS.password
    ) {
      // Store auth state in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('username', formData.username);
      
      // Navigate to loan page
      navigate('/loan');
    } else {
      setLoginError('Invalid username or password');
    }
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
              PSSLAI Loan Application
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

            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
              Legacy credentials: psslaimember / 1234
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
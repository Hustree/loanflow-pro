import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Divider,
  InputAdornment,
  Fade,
} from '@mui/material';
import {
  Fingerprint,
  FaceRetouchingNatural,
  Security,
  Email,
  Phone,
  ArrowBack,
  CheckCircle,
  PersonAdd,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  registerPasskey, 
  checkPasskeySupport,
  clearError,
} from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store/store';

export const PasskeyRegister: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || location.state?.identifier || 'test@psslai.com');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { 
    isSupported, 
    loading, 
    error,
    registrationStep,
  } = useSelector((state: RootState) => state.passkey);

  useEffect(() => {
    dispatch(checkPasskeySupport());
  }, [dispatch]);

  useEffect(() => {
    // Auto-generate display name from email
    if (email && !displayName) {
      const name = email.split('@')[0];
      setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [email, displayName]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isPhoneNumber = (value: string) => {
    return /^(\+?63|0)?9\d{9}$/.test(value.replace(/\s/g, ''));
  };

  const formatIdentifier = (value: string) => {
    if (isPhoneNumber(value)) {
      // Format as Philippine mobile number
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.startsWith('63')) {
        return `+${cleaned}`;
      } else if (cleaned.startsWith('0')) {
        return `+63${cleaned.substring(1)}`;
      } else if (cleaned.startsWith('9')) {
        return `+63${cleaned}`;
      }
    }
    return value;
  };

  const handleRegister = async () => {
    if (!email || !displayName) return;
    
    setIsRegistering(true);
    try {
      const formattedEmail = formatIdentifier(email);
      const result = await dispatch(registerPasskey({ 
        email: formattedEmail, 
        displayName 
      })).unwrap();
      
      if (result.success) {
        // Store auth token if provided
        if (result.token) {
          sessionStorage.setItem('authToken', result.token);
        }
        
        // Set authentication state for protected route access
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', email);
        
        // Navigate to dashboard with success message
        navigate('/dashboard', {
          state: {
            message: 'Passkey registered successfully! You can now use Face ID/Touch ID to sign in.',
            severity: 'success'
          }
        });
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      
      // Show specific error message based on error type
      if (err.message?.includes('already exists')) {
        navigate('/login/passkey', { 
          state: { 
            email,
            message: 'You already have a passkey registered. Please sign in instead.' 
          }
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const getBiometricIcon = () => {
    const ua = navigator.userAgent;
    if (/iPhone.*Face/i.test(ua) || /iPad.*Face/i.test(ua)) {
      return <FaceRetouchingNatural />;
    }
    if (/Android/i.test(ua)) {
      return <Fingerprint />;
    }
    return <Security />;
  };

  const getBiometricText = () => {
    const ua = navigator.userAgent;
    if (/iPhone.*Face/i.test(ua) || /iPad.*Face/i.test(ua)) {
      return 'Register with Face ID';
    }
    if (/iPhone/i.test(ua) || /iPad/i.test(ua)) {
      return 'Register with Touch ID';
    }
    if (/Android/i.test(ua)) {
      return 'Register with Fingerprint';
    }
    return 'Register Passkey';
  };

  const getStepMessage = () => {
    switch (registrationStep) {
      case 'started':
        return 'Preparing passkey registration...';
      case 'prompting':
        return 'Please verify your identity to create your passkey';
      case 'verifying':
        return 'Creating your passkey...';
      case 'completed':
        return 'Passkey created successfully!';
      default:
        return null;
    }
  };

  if (!isSupported) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your device doesn't support passkey authentication.
        </Alert>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Use Traditional Login
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box textAlign="center">
          <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Create Your Passkey
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up secure biometric authentication
          </Typography>
        </Box>

        {/* Show message from previous page */}
        {location.state?.message && (
          <Alert severity="info">
            {location.state.message}
          </Alert>
        )}

        {/* Email Input */}
        <TextField
          fullWidth
          label="Email or Mobile Number"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan@email.com or 09171234567"
          autoComplete="username"
          disabled={loading || isRegistering}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isEmail(email) ? <Email /> : <Phone />}
              </InputAdornment>
            ),
          }}
          helperText={
            isPhoneNumber(email) 
              ? 'Philippine mobile number detected' 
              : isEmail(email)
              ? 'Email address detected'
              : ''
          }
        />

        {/* Display Name Input */}
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you'd like to be called"
          autoComplete="name"
          disabled={loading || isRegistering}
          helperText="This name will be shown when you use your passkey"
        />

        {/* Registration Step Message */}
        {registrationStep !== 'idle' && (
          <Fade in>
            <Alert 
              severity={registrationStep === 'completed' ? 'success' : 'info'}
              icon={registrationStep === 'completed' ? <CheckCircle /> : <CircularProgress size={20} />}
            >
              {getStepMessage()}
            </Alert>
          </Fade>
        )}

        {/* Register Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleRegister}
          disabled={loading || !email || !displayName || isRegistering}
          startIcon={
            loading || isRegistering ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              getBiometricIcon()
            )
          }
        >
          {loading || isRegistering ? 'Creating...' : getBiometricText()}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        <Divider>OR</Divider>

        {/* Alternative Options */}
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login/passkey', { state: { identifier: email } })}
            startIcon={<ArrowBack />}
          >
            Back to Sign In
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            size="small"
          >
            Use Traditional Login
          </Button>
        </Stack>

        {/* Footer */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Your passkey will be stored securely on this device
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
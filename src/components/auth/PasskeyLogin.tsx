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
  Link,
  InputAdornment,
  Fade,
} from '@mui/material';
import {
  Fingerprint,
  FaceRetouchingNatural,
  Smartphone,
  Security,
  Email,
  Phone,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  authenticateWithPasskey, 
  checkPasskeySupport,
  clearError,
  checkHasPasskeys,
} from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store/store';

export const PasskeyLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('test@psslai.com');
  const [showFallback, setShowFallback] = useState(false);
  const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  
  const { 
    isSupported, 
    loading, 
    error,
    authenticationStep,
  } = useSelector((state: RootState) => state.passkey);

  useEffect(() => {
    dispatch(checkPasskeySupport());
  }, [dispatch]);

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

  const handleCheckPasskey = async () => {
    if (!identifier) return;
    
    setIsCheckingPasskey(true);
    try {
      const formattedId = formatIdentifier(identifier);
      const result = await dispatch(checkHasPasskeys(formattedId)).unwrap();
      setHasPasskey(result);
      
      if (result && isSupported) {
        // User has passkey and browser supports it
        handlePasskeyLogin();
      } else {
        // No passkey or not supported
        setShowFallback(true);
      }
    } catch (err) {
      setShowFallback(true);
    } finally {
      setIsCheckingPasskey(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!identifier) return;
    
    try {
      const formattedId = formatIdentifier(identifier);
      const result = await dispatch(authenticateWithPasskey(formattedId)).unwrap();
      
      if (result.success) {
        // Store auth token if provided
        if (result.token) {
          sessionStorage.setItem('authToken', result.token);
        }
        
        // Set authentication state for protected route access
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', formattedId);
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setShowFallback(true);
      
      // Show specific error message
      if (err.message?.includes('No passkeys found')) {
        navigate('/register', { 
          state: { 
            email: identifier,
            message: 'No passkeys found. Please register first.' 
          }
        });
      }
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
      return 'Continue with Face ID';
    }
    if (/iPhone/i.test(ua) || /iPad/i.test(ua)) {
      return 'Continue with Touch ID';
    }
    if (/Android/i.test(ua)) {
      return 'Continue with Fingerprint';
    }
    return 'Continue with Passkey';
  };

  const getStepMessage = () => {
    switch (authenticationStep) {
      case 'started':
        return 'Preparing authentication...';
      case 'prompting':
        return 'Please verify your identity on your device';
      case 'verifying':
        return 'Verifying your credentials...';
      case 'completed':
        return 'Authentication successful!';
      default:
        return null;
    }
  };

  if (!isSupported && !showFallback) {
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
          <Smartphone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Welcome to PSSLAI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in securely with your device
          </Typography>
        </Box>

        {/* Email/Phone Input */}
        <TextField
          fullWidth
          label="Email or Mobile Number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="juan@email.com or 09171234567"
          autoComplete="username"
          autoFocus
          disabled={loading || isCheckingPasskey}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isEmail(identifier) ? <Email /> : <Phone />}
              </InputAdornment>
            ),
          }}
          helperText={
            isPhoneNumber(identifier) 
              ? 'Philippine mobile number detected' 
              : isEmail(identifier)
              ? 'Email address detected'
              : ''
          }
        />

        {/* Authentication Step Message */}
        {authenticationStep !== 'idle' && (
          <Fade in>
            <Alert 
              severity={authenticationStep === 'completed' ? 'success' : 'info'}
              icon={authenticationStep === 'completed' ? <CheckCircle /> : <CircularProgress size={20} />}
            >
              {getStepMessage()}
            </Alert>
          </Fade>
        )}

        {/* Main Action Button */}
        {!showFallback ? (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCheckPasskey}
            disabled={loading || !identifier || isCheckingPasskey}
            startIcon={
              loading || isCheckingPasskey ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                getBiometricIcon()
              )
            }
          >
            {loading || isCheckingPasskey ? 'Checking...' : getBiometricText()}
          </Button>
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">
              {hasPasskey 
                ? 'Passkey authentication unavailable. Please use an alternative method.'
                : 'No passkey found for this account. Please use an alternative method or register a passkey.'
              }
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login/otp', { state: { identifier } })}
            >
              Continue with OTP
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login', { state: { identifier } })}
            >
              Use Password
            </Button>
            {!hasPasskey && (
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register', { state: { identifier } })}
              >
                Register New Passkey
              </Button>
            )}
          </Stack>
        )}

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
          {!showFallback && (
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowFallback(true)}
              size="small"
            >
              Use other sign-in methods
            </Button>
          )}
          
          {showFallback && (
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowFallback(false)}
              startIcon={<ArrowBack />}
              size="small"
            >
              Back to passkey login
            </Button>
          )}
        </Stack>

        {/* Footer */}
        <Box textAlign="center">
          <Typography variant="body2">
            New member?{' '}
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              underline="hover"
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  Check,
  Security,
  Smartphone,
  Speed,
  NoEncryption,
  FaceRetouchingNatural,
  Fingerprint,
  Devices,
  ErrorOutline,
  Info,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { registerPasskey, clearError, resetSteps } from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store/store';

interface Props {
  email: string;
  displayName: string;
  onComplete: () => void;
  onSkip: () => void;
  showSkip?: boolean;
}

export const PasskeyRegistration: React.FC<Props> = ({
  email,
  displayName,
  onComplete,
  onSkip,
  showSkip = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [registrationStarted, setRegistrationStarted] = useState(false);
  
  const { 
    loading, 
    error, 
    registrationStep,
    isSupported,
  } = useSelector((state: RootState) => state.passkey);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(resetSteps());
    };
  }, [dispatch]);

  useEffect(() => {
    // Auto-advance steps based on registration progress
    if (registrationStep === 'completed' && step === 1) {
      setStep(2);
      setTimeout(onComplete, 3000); // Auto-complete after 3 seconds
    }
  }, [registrationStep, step, onComplete]);

  const benefits = [
    {
      icon: <NoEncryption color="primary" />,
      title: 'No passwords to remember',
      description: 'Use Face ID, Touch ID, or fingerprint instead',
    },
    {
      icon: <Security color="primary" />,
      title: 'Enhanced security',
      description: 'Your biometric data never leaves your device',
    },
    {
      icon: <Speed color="primary" />,
      title: 'Lightning-fast login',
      description: 'Sign in with just a tap or glance',
    },
    {
      icon: <Devices color="primary" />,
      title: 'Multi-device support',
      description: 'Register up to 5 devices per account',
    },
  ];

  const getDeviceIcon = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad/i.test(ua)) {
      return <FaceRetouchingNatural sx={{ fontSize: 60 }} />;
    }
    if (/Android/i.test(ua)) {
      return <Fingerprint sx={{ fontSize: 60 }} />;
    }
    return <Security sx={{ fontSize: 60 }} />;
  };

  const getDeviceInstructions = () => {
    const ua = navigator.userAgent;
    if (/iPhone.*Face/i.test(ua) || /iPad.*Face/i.test(ua)) {
      return 'Position your face in the frame and follow the on-screen instructions';
    }
    if (/iPhone/i.test(ua) || /iPad/i.test(ua)) {
      return 'Place your finger on the Touch ID sensor';
    }
    if (/Android/i.test(ua)) {
      return 'Place your finger on the fingerprint sensor or look at the camera';
    }
    return 'Follow your device\'s authentication prompt';
  };

  const handleSetupPasskey = async () => {
    if (registrationStarted) return; // Prevent double registration
    
    try {
      setRegistrationStarted(true);
      setStep(1);
      
      const result = await dispatch(
        registerPasskey({ email, displayName })
      ).unwrap();
      
      if (result.success) {
        // Registration successful
        console.log('Passkey registered successfully:', result);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setRegistrationStarted(false);
      
      // Handle specific errors
      if (err.message?.includes('cancelled')) {
        setStep(0); // Go back to first step
      }
    }
  };

  const handleRetry = () => {
    setRegistrationStarted(false);
    dispatch(clearError());
    dispatch(resetSteps());
    handleSetupPasskey();
  };

  const getProgressValue = () => {
    switch (registrationStep) {
      case 'started': return 25;
      case 'prompting': return 50;
      case 'verifying': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getRegistrationMessage = () => {
    switch (registrationStep) {
      case 'started':
        return 'Initializing secure registration...';
      case 'prompting':
        return getDeviceInstructions();
      case 'verifying':
        return 'Verifying your biometric data...';
      case 'completed':
        return 'Passkey created successfully!';
      default:
        return '';
    }
  };

  if (!isSupported) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Alert severity="warning" icon={<ErrorOutline />}>
          <Typography variant="subtitle1" gutterBottom>
            Passkey Not Supported
          </Typography>
          <Typography variant="body2">
            Your device or browser doesn't support passkey authentication. 
            Please use OTP or password authentication instead.
          </Typography>
        </Alert>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={onSkip}
        >
          Continue with Alternative Method
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Stepper activeStep={step} orientation="vertical">
        {/* Step 1: Learn about Passkeys */}
        <Step>
          <StepLabel 
            optional={
              <Typography variant="caption">Secure authentication setup</Typography>
            }
          >
            Learn about Passkeys
          </StepLabel>
          <StepContent>
            <Stack spacing={3}>
              <Box textAlign="center">
                <Smartphone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Set up secure, passwordless login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  for {email}
                </Typography>
              </Box>
              
              <List dense>
                {benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{benefit.icon}</ListItemIcon>
                    <ListItemText
                      primary={benefit.title}
                      secondary={benefit.description}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>

              <Collapse in={showDetails}>
                <Alert severity="info" icon={<Info />}>
                  <Typography variant="subtitle2" gutterBottom>
                    How it works:
                  </Typography>
                  <Typography variant="body2">
                    Passkeys use public-key cryptography. Your device creates a unique 
                    key pair - the private key stays secure on your device, while the 
                    public key is stored on our servers. This means even if our servers 
                    were compromised, your account would remain secure.
                  </Typography>
                </Alert>
              </Collapse>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSetupPasskey}
                  disabled={loading || registrationStarted}
                  fullWidth
                >
                  Set Up Passkey
                </Button>
                {showSkip && (
                  <Button 
                    variant="outlined" 
                    onClick={onSkip}
                    disabled={loading || registrationStarted}
                  >
                    Skip
                  </Button>
                )}
              </Stack>

              <Button
                variant="text"
                size="small"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Learn more'}
              </Button>
            </Stack>
          </StepContent>
        </Step>

        {/* Step 2: Create Your Passkey */}
        <Step>
          <StepLabel
            optional={
              <Typography variant="caption">Biometric verification</Typography>
            }
          >
            Create Your Passkey
          </StepLabel>
          <StepContent>
            <Stack spacing={3} alignItems="center">
              {loading || registrationStep !== 'idle' ? (
                <>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    {getDeviceIcon()}
                    {registrationStep === 'prompting' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress size={80} thickness={2} />
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="body1" align="center">
                    {getRegistrationMessage()}
                  </Typography>
                  
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressValue()}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  
                  {registrationStep === 'prompting' && (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      <Typography variant="body2">
                        A prompt should appear on your device. Please complete 
                        the biometric verification to continue.
                      </Typography>
                    </Alert>
                  )}
                </>
              ) : error ? (
                <>
                  <ErrorOutline sx={{ fontSize: 60, color: 'error.main' }} />
                  <Alert severity="error" sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Registration Failed
                    </Typography>
                    <Typography variant="body2">
                      {error}
                    </Typography>
                  </Alert>
                  <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button 
                      onClick={handleRetry} 
                      variant="contained"
                      fullWidth
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={onSkip} 
                      variant="outlined"
                      fullWidth
                    >
                      Skip
                    </Button>
                  </Stack>
                </>
              ) : null}
            </Stack>
          </StepContent>
        </Step>

        {/* Step 3: Setup Complete */}
        <Step>
          <StepLabel
            optional={
              <Typography variant="caption">Ready to use</Typography>
            }
          >
            Setup Complete!
          </StepLabel>
          <StepContent>
            <Card 
              sx={{ 
                bgcolor: 'success.light', 
                color: 'success.contrastText',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Avatar 
                    sx={{ 
                      bgcolor: 'success.main', 
                      width: 56, 
                      height: 56 
                    }}
                  >
                    <Check sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" align="center">
                    Passkey Created Successfully!
                  </Typography>
                  <Typography variant="body2" align="center">
                    You can now sign in quickly and securely using your device's biometrics
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip 
                      icon={<Smartphone />} 
                      label="Device registered" 
                      color="success" 
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      icon={<Security />} 
                      label="Secure" 
                      color="success" 
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={onComplete}
            >
              Continue to Dashboard
            </Button>
          </StepContent>
        </Step>
      </Stepper>
    </Paper>
  );
};
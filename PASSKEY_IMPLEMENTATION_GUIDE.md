# Passkey Authentication - Technical Implementation Guide
## React MVP Loan App

---

## Quick Start Implementation

### 1. Install Dependencies

```bash
npm install @simplewebauthn/browser @simplewebauthn/server
npm install --save-dev @types/webappsec-credential-management
```

### 2. Core Implementation Files

```typescript
// src/services/passkeyService.ts
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import { z } from 'zod';

// Zod Schemas for Validation
export const PasskeyCredentialSchema = z.object({
  id: z.string(),
  userId: z.string(),
  publicKey: z.string(),
  credentialId: z.string(),
  counter: z.number(),
  deviceName: z.string(),
  deviceType: z.enum(['mobile', 'desktop', 'tablet']),
  browser: z.string(),
  os: z.string(),
  createdAt: z.date(),
  lastUsedAt: z.date(),
  isActive: z.boolean(),
});

export const RegistrationOptionsSchema = z.object({
  challenge: z.string(),
  rp: z.object({
    name: z.string(),
    id: z.string().optional(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  pubKeyCredParams: z.array(z.object({
    alg: z.number(),
    type: z.literal('public-key'),
  })),
  timeout: z.number().optional(),
  attestation: z.string().optional(),
  authenticatorSelection: z.object({
    authenticatorAttachment: z.string().optional(),
    requireResidentKey: z.boolean().optional(),
    userVerification: z.string().optional(),
  }).optional(),
});

export class PasskeyService {
  private static instance: PasskeyService;
  
  private constructor() {}
  
  public static getInstance(): PasskeyService {
    if (!PasskeyService.instance) {
      PasskeyService.instance = new PasskeyService();
    }
    return PasskeyService.instance;
  }

  // Check browser support
  checkSupport(): boolean {
    return browserSupportsWebAuthn();
  }

  // Detect device information
  getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    return {
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua, platform),
      deviceName: this.generateDeviceName(),
    };
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private detectBrowser(ua: string): string {
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  private detectOS(ua: string, platform: string): string {
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Mac/i.test(platform)) return 'macOS';
    if (/Win/i.test(platform)) return 'Windows';
    if (/Linux/i.test(platform)) return 'Linux';
    return 'Unknown';
  }

  private generateDeviceName(): string {
    const device = this.getDeviceInfo();
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${device.browser} on ${device.os} (${date})`;
  }

  // Start registration process
  async startRegistration(email: string, displayName: string) {
    try {
      // Get registration options from server
      const response = await fetch('/api/auth/passkey/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName }),
      });
      
      const options = await response.json();
      
      // Validate server response
      const validatedOptions = RegistrationOptionsSchema.parse(options);
      
      // Start WebAuthn registration
      const credential = await startRegistration(validatedOptions);
      
      // Add device info
      const deviceInfo = this.getDeviceInfo();
      
      // Verify with server
      const verifyResponse = await fetch('/api/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          deviceInfo,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }
      
      return await verifyResponse.json();
    } catch (error) {
      console.error('Passkey registration failed:', error);
      throw error;
    }
  }

  // Start authentication process
  async startAuthentication(email: string) {
    try {
      // Get authentication options from server
      const response = await fetch('/api/auth/passkey/login/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const options = await response.json();
      
      // Start WebAuthn authentication
      const credential = await startAuthentication(options);
      
      // Verify with server
      const verifyResponse = await fetch('/api/auth/passkey/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          credential,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }
      
      return await verifyResponse.json();
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      throw error;
    }
  }
}

export const passkeyService = PasskeyService.getInstance();
```

### 3. Redux State Management

```typescript
// src/store/slices/passkeySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { passkeyService } from '../../services/passkeyService';

interface PasskeyState {
  isSupported: boolean;
  isRegistered: boolean;
  devices: PasskeyDevice[];
  currentChallenge: string | null;
  loading: boolean;
  error: string | null;
}

interface PasskeyDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  lastUsed: string;
  createdAt: string;
}

const initialState: PasskeyState = {
  isSupported: false,
  isRegistered: false,
  devices: [],
  currentChallenge: null,
  loading: false,
  error: null,
};

// Async thunks
export const checkPasskeySupport = createAsyncThunk(
  'passkey/checkSupport',
  async () => {
    return passkeyService.checkSupport();
  }
);

export const registerPasskey = createAsyncThunk(
  'passkey/register',
  async ({ email, displayName }: { email: string; displayName: string }) => {
    return await passkeyService.startRegistration(email, displayName);
  }
);

export const authenticateWithPasskey = createAsyncThunk(
  'passkey/authenticate',
  async (email: string) => {
    return await passkeyService.startAuthentication(email);
  }
);

const passkeySlice = createSlice({
  name: 'passkey',
  initialState,
  reducers: {
    setSupported: (state, action: PayloadAction<boolean>) => {
      state.isSupported = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addDevice: (state, action: PayloadAction<PasskeyDevice>) => {
      state.devices.push(action.payload);
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(d => d.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Check support
      .addCase(checkPasskeySupport.fulfilled, (state, action) => {
        state.isSupported = action.payload;
      })
      // Registration
      .addCase(registerPasskey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPasskey.fulfilled, (state, action) => {
        state.loading = false;
        state.isRegistered = true;
        state.devices.push(action.payload.device);
      })
      .addCase(registerPasskey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Authentication
      .addCase(authenticateWithPasskey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticateWithPasskey.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(authenticateWithPasskey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Authentication failed';
      });
  },
});

export const { setSupported, clearError, addDevice, removeDevice } = passkeySlice.actions;
export default passkeySlice.reducer;
```

### 4. React Components

```typescript
// src/components/auth/PasskeyLogin.tsx
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
} from '@mui/material';
import {
  Fingerprint,
  FaceRetouchingNatural,
  Smartphone,
  Security,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authenticateWithPasskey, checkPasskeySupport } from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store';

export const PasskeyLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  
  const { isSupported, loading, error } = useSelector(
    (state: RootState) => state.passkey
  );

  useEffect(() => {
    dispatch(checkPasskeySupport());
  }, [dispatch]);

  const handlePasskeyLogin = async () => {
    if (!email) {
      return;
    }
    
    try {
      const result = await dispatch(authenticateWithPasskey(email)).unwrap();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setShowFallback(true);
    }
  };

  const getBiometricIcon = () => {
    const ua = navigator.userAgent;
    if (/iPhone.*FaceID/i.test(ua)) return <FaceRetouchingNatural />;
    if (/Android/i.test(ua)) return <Fingerprint />;
    return <Security />;
  };

  const getBiometricText = () => {
    const ua = navigator.userAgent;
    if (/iPhone.*FaceID/i.test(ua)) return 'Continue with Face ID';
    if (/iPhone/i.test(ua)) return 'Continue with Touch ID';
    if (/Android/i.test(ua)) return 'Continue with Fingerprint';
    return 'Continue with Passkey';
  };

  if (!isSupported) {
    return (
      <Alert severity="warning">
        Your device doesn't support passkey authentication. 
        Please use OTP or password login instead.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Stack spacing={3}>
        <Box textAlign="center">
          <Smartphone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Welcome to PSSLAI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in securely with your device
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Email or Mobile Number"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan@email.com or 09171234567"
          autoComplete="username"
          autoFocus
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePasskeyLogin}
          disabled={loading || !email}
          startIcon={loading ? <CircularProgress size={20} /> : getBiometricIcon()}
        >
          {loading ? 'Authenticating...' : getBiometricText()}
        </Button>

        {error && (
          <Alert severity="error" onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        <Divider>OR</Divider>

        {showFallback && (
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login/otp')}
            >
              Use OTP Instead
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login/password')}
            >
              Use Password
            </Button>
          </Stack>
        )}

        <Box textAlign="center">
          <Typography variant="body2">
            New member?{' '}
            <Link href="/register" underline="hover">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
```

```typescript
// src/components/auth/PasskeyRegistration.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Check,
  Security,
  Smartphone,
  Speed,
  NoEncryption,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { registerPasskey } from '../../store/slices/passkeySlice';
import { RootState, AppDispatch } from '../../store';

interface Props {
  email: string;
  displayName: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const PasskeyRegistration: React.FC<Props> = ({
  email,
  displayName,
  onComplete,
  onSkip,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(0);
  const { loading, error } = useSelector((state: RootState) => state.passkey);

  const benefits = [
    {
      icon: <NoEncryption />,
      title: 'No passwords to remember',
      description: 'Use Face ID or fingerprint instead',
    },
    {
      icon: <Security />,
      title: 'More secure',
      description: 'Your biometric data never leaves your device',
    },
    {
      icon: <Speed />,
      title: 'Faster login',
      description: 'Sign in with just a tap',
    },
    {
      icon: <Smartphone />,
      title: 'Works everywhere',
      description: 'Use on phone, tablet, or computer',
    },
  ];

  const handleSetupPasskey = async () => {
    try {
      setStep(1);
      const result = await dispatch(
        registerPasskey({ email, displayName })
      ).unwrap();
      
      if (result.success) {
        setStep(2);
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Stepper activeStep={step} orientation="vertical">
        <Step>
          <StepLabel>Learn about Passkeys</StepLabel>
          <StepContent>
            <Stack spacing={3}>
              <Typography variant="h6">
                Set up secure, passwordless login
              </Typography>
              
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{benefit.icon}</ListItemIcon>
                    <ListItemText
                      primary={benefit.title}
                      secondary={benefit.description}
                    />
                  </ListItem>
                ))}
              </List>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSetupPasskey}
                  disabled={loading}
                >
                  Set Up Passkey
                </Button>
                <Button variant="text" onClick={onSkip}>
                  Skip for Now
                </Button>
              </Stack>
            </Stack>
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Create Your Passkey</StepLabel>
          <StepContent>
            <Stack spacing={3} alignItems="center">
              {loading ? (
                <>
                  <CircularProgress size={60} />
                  <Typography variant="body1">
                    Follow the prompt on your device...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You may need to scan your face or fingerprint
                  </Typography>
                </>
              ) : error ? (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                  <Button onClick={handleSetupPasskey} sx={{ mt: 1 }}>
                    Try Again
                  </Button>
                </Alert>
              ) : null}
            </Stack>
          </StepContent>
        </Step>

        <Step>
          <StepLabel>Setup Complete!</StepLabel>
          <StepContent>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Check sx={{ fontSize: 48 }} />
                  <Typography variant="h6">
                    Passkey Created Successfully!
                  </Typography>
                  <Typography variant="body2">
                    You can now sign in with Face ID or fingerprint
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </StepContent>
        </Step>
      </Stepper>
    </Paper>
  );
};
```

### 5. Firebase Cloud Functions (Backend)

```typescript
// functions/src/passkey.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const db = admin.firestore();

// Environment configuration
const RP_NAME = 'PSSLAI Loan App';
const RP_ID = 'psslai.com';
const ORIGIN = ['https://psslai.com', 'https://app.psslai.com'];

// Registration - Begin
export const registerBegin = functions.https.onRequest(async (req, res) => {
  const { email, displayName } = req.body;
  
  try {
    // Generate user ID
    const userId = isoBase64URL.fromString(email);
    
    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: userId,
      userName: email,
      userDisplayName: displayName,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });
    
    // Store challenge in Firestore (expires in 5 minutes)
    await db.collection('challenges').doc(userId).set({
      challenge: options.challenge,
      email,
      type: 'registration',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    
    res.json(options);
  } catch (error) {
    console.error('Registration begin error:', error);
    res.status(500).json({ error: 'Failed to start registration' });
  }
});

// Registration - Verify
export const registerVerify = functions.https.onRequest(async (req, res) => {
  const { credential, deviceInfo } = req.body;
  
  try {
    // Get stored challenge
    const userId = credential.response.userHandle;
    const challengeDoc = await db.collection('challenges').doc(userId).get();
    
    if (!challengeDoc.exists) {
      return res.status(400).json({ error: 'Challenge not found' });
    }
    
    const { challenge, email } = challengeDoc.data()!;
    
    // Verify registration
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
    
    if (!verification.verified) {
      return res.status(400).json({ error: 'Verification failed' });
    }
    
    // Store passkey credential
    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo!;
    
    await db.collection('passkeys').add({
      userId,
      email,
      credentialId: isoBase64URL.fromBuffer(credentialID),
      publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
      counter,
      ...deviceInfo,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });
    
    // Clean up challenge
    await db.collection('challenges').doc(userId).delete();
    
    // Create Firebase custom token for session
    const firebaseToken = await admin.auth().createCustomToken(userId);
    
    res.json({
      success: true,
      token: firebaseToken,
      device: {
        id: credentialID,
        name: deviceInfo.deviceName,
        type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Registration verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Authentication - Begin
export const loginBegin = functions.https.onRequest(async (req, res) => {
  const { email } = req.body;
  
  try {
    // Get user's passkeys
    const passkeysSnapshot = await db
      .collection('passkeys')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .get();
    
    if (passkeysSnapshot.empty) {
      return res.status(404).json({ error: 'No passkeys found' });
    }
    
    // Build allowed credentials list
    const allowCredentials = passkeysSnapshot.docs.map(doc => ({
      id: doc.data().credentialId,
      type: 'public-key',
      transports: ['internal', 'hybrid'],
    }));
    
    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials,
      userVerification: 'preferred',
    });
    
    // Store challenge
    const userId = isoBase64URL.fromString(email);
    await db.collection('challenges').doc(userId).set({
      challenge: options.challenge,
      email,
      type: 'authentication',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    
    res.json(options);
  } catch (error) {
    console.error('Login begin error:', error);
    res.status(500).json({ error: 'Failed to start authentication' });
  }
});

// Authentication - Verify
export const loginVerify = functions.https.onRequest(async (req, res) => {
  const { email, credential } = req.body;
  
  try {
    // Get stored challenge
    const userId = isoBase64URL.fromString(email);
    const challengeDoc = await db.collection('challenges').doc(userId).get();
    
    if (!challengeDoc.exists) {
      return res.status(400).json({ error: 'Challenge not found' });
    }
    
    const { challenge } = challengeDoc.data()!;
    
    // Get passkey for verification
    const passkeySnapshot = await db
      .collection('passkeys')
      .where('email', '==', email)
      .where('credentialId', '==', credential.id)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    if (passkeySnapshot.empty) {
      return res.status(404).json({ error: 'Passkey not found' });
    }
    
    const passkeyDoc = passkeySnapshot.docs[0];
    const passkeyData = passkeyDoc.data();
    
    // Verify authentication
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(passkeyData.credentialId),
        credentialPublicKey: isoBase64URL.toBuffer(passkeyData.publicKey),
        counter: passkeyData.counter,
      },
    });
    
    if (!verification.verified) {
      return res.status(400).json({ error: 'Authentication failed' });
    }
    
    // Update counter and last used
    await passkeyDoc.ref.update({
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Clean up challenge
    await db.collection('challenges').doc(userId).delete();
    
    // Create Firebase session
    const firebaseToken = await admin.auth().createCustomToken(userId);
    
    res.json({
      success: true,
      token: firebaseToken,
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});
```

### 6. Enhanced AuthContext Integration

```typescript
// src/contexts/AuthContext.tsx (enhanced)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { firebaseService } from '../services/firebaseService';
import { passkeyService } from '../services/passkeyService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPasskey: (email: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  registerPasskey: (email: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPasskey: boolean;
  passkeySupported: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);

  useEffect(() => {
    // Check passkey support
    setPasskeySupported(passkeyService.checkSupport());
    
    // Check if user has passkeys
    if (user?.email) {
      checkUserPasskeys(user.email);
    }
  }, [user]);

  const checkUserPasskeys = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/passkey/check?email=${email}`);
      const data = await response.json();
      setHasPasskey(data.hasPasskey);
    } catch (err) {
      console.error('Failed to check passkeys:', err);
    }
  };

  const loginWithPasskey = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await passkeyService.startAuthentication(email);
      
      if (result.token) {
        // Sign in with custom token
        await firebaseService.signInWithCustomToken(result.token);
      }
    } catch (err: any) {
      setError(err.message || 'Passkey login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async (email: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await passkeyService.startRegistration(email, displayName);
      
      if (result.success) {
        setHasPasskey(true);
      }
    } catch (err: any) {
      setError(err.message || 'Passkey registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the implementation
};
```

### 7. Progressive Web App (PWA) Configuration

```json
// public/manifest.json (update)
{
  "name": "PSSLAI Loan App",
  "short_name": "PSSLAI",
  "description": "Secure loan application with biometric authentication",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "prefer_related_applications": false,
  "related_applications": []
}
```

```typescript
// src/serviceWorkerRegistration.ts
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('SW registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        },
        (error) => {
          console.log('SW registration failed:', error);
        }
      );
    });
  }
}
```

---

## Testing & Debugging

### Browser Console Tests

```javascript
// Test WebAuthn support
if (window.PublicKeyCredential) {
  console.log('✅ WebAuthn is supported');
  
  // Check platform authenticator
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    .then(available => {
      console.log('Platform authenticator available:', available);
    });
} else {
  console.log('❌ WebAuthn not supported');
}

// Test conditional mediation (autofill)
if (window.PublicKeyCredential?.isConditionalMediationAvailable) {
  PublicKeyCredential.isConditionalMediationAvailable()
    .then(available => {
      console.log('Conditional mediation available:', available);
    });
}
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "User gesture required" | Ensure registration/login triggered by user click |
| "Origin not allowed" | Check HTTPS and domain configuration |
| "Authenticator not found" | Device may not support platform authenticator |
| "Challenge mismatch" | Ensure challenge hasn't expired (5 min timeout) |
| "User cancelled" | Normal - user declined biometric prompt |

---

## Deployment Checklist

- [ ] HTTPS enabled on all domains
- [ ] Firebase project configured
- [ ] Cloud Functions deployed
- [ ] Environment variables set
- [ ] CORS configured for API endpoints
- [ ] PWA manifest validated
- [ ] Service worker registered
- [ ] Browser compatibility tested
- [ ] Fallback mechanisms tested
- [ ] Security headers configured
- [ ] Analytics events tracking

---

*Implementation Guide Version: 1.0*
*Compatible with: @simplewebauthn/browser@10.0.0*
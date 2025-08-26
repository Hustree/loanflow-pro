import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { passkeyService } from '../../services/passkeyService';
import { AndroidDeviceInfo } from '../../services/androidBiometricService';

export interface PasskeyDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  lastUsed: string;
  createdAt: string;
  // Android biometric fields
  biometricType?: 'fingerprint' | 'face' | 'iris' | 'multiple';
  securityClass?: 1 | 2 | 3;
  hardwareBacked?: boolean;
  lastBiometricUsed?: string;
  biometricFailureCount?: number;
}

export interface BiometricEnrollmentState {
  isEnrolling: boolean;
  enrollmentType?: 'fingerprint' | 'face' | 'iris';
  error?: string;
  success?: boolean;
}

interface PasskeyState {
  isSupported: boolean;
  isAutofillSupported: boolean;
  isRegistered: boolean;
  devices: PasskeyDevice[];
  currentChallenge: string | null;
  loading: boolean;
  error: string | null;
  registrationStep: 'idle' | 'started' | 'prompting' | 'verifying' | 'completed';
  authenticationStep: 'idle' | 'started' | 'prompting' | 'verifying' | 'completed';
  
  // New Android-specific state
  androidCapabilities: AndroidDeviceInfo | null;
  biometricEnrollment: BiometricEnrollmentState;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  availableBiometrics: string[];
  enrolledBiometrics: string[];
  isAndroidDevice: boolean;
}

const initialState: PasskeyState = {
  isSupported: false,
  isAutofillSupported: false,
  isRegistered: false,
  devices: [],
  currentChallenge: null,
  loading: false,
  error: null,
  registrationStep: 'idle',
  authenticationStep: 'idle',
  
  // Android-specific initial state
  androidCapabilities: null,
  biometricEnrollment: {
    isEnrolling: false,
  },
  securityLevel: null,
  availableBiometrics: [],
  enrolledBiometrics: [],
  isAndroidDevice: false,
};

// Async thunks
export const checkPasskeySupport = createAsyncThunk(
  'passkey/checkSupport',
  async () => {
    const isSupported = passkeyService.checkSupport();
    const isAutofillSupported = await passkeyService.checkAutofillSupport();
    return { isSupported, isAutofillSupported };
  }
);

export const registerPasskey = createAsyncThunk(
  'passkey/register',
  async ({ email, displayName }: { email: string; displayName: string }, { dispatch }) => {
    dispatch(setRegistrationStep('started'));
    
    try {
      dispatch(setRegistrationStep('prompting'));
      const result = await passkeyService.startRegistration(email, displayName);
      
      dispatch(setRegistrationStep('verifying'));
      
      if (result.success) {
        dispatch(setRegistrationStep('completed'));
        return result;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      dispatch(setRegistrationStep('idle'));
      throw error;
    }
  }
);

export const authenticateWithPasskey = createAsyncThunk(
  'passkey/authenticate',
  async (email: string, { dispatch }) => {
    dispatch(setAuthenticationStep('started'));
    
    try {
      dispatch(setAuthenticationStep('prompting'));
      const result = await passkeyService.startAuthentication(email);
      
      dispatch(setAuthenticationStep('verifying'));
      
      if (result.success) {
        dispatch(setAuthenticationStep('completed'));
        return result;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      dispatch(setAuthenticationStep('idle'));
      throw error;
    }
  }
);

export const loadUserPasskeys = createAsyncThunk(
  'passkey/loadDevices',
  async (email: string) => {
    const passkeys = await passkeyService.getUserPasskeys(email);
    return passkeys.map(p => ({
      id: p.id,
      name: p.deviceInfo?.deviceName || p.deviceName || 'Unknown Device',
      type: p.deviceInfo?.deviceType || 'desktop',
      browser: p.deviceInfo?.browser || 'Unknown',
      os: p.deviceInfo?.os || 'Unknown',
      lastUsed: p.lastUsed || p.createdAt,
      createdAt: p.createdAt,
    }));
  }
);

export const removePasskey = createAsyncThunk(
  'passkey/remove',
  async ({ passkeyId, email }: { passkeyId: string; email: string }) => {
    const success = await passkeyService.removePasskey(passkeyId);
    if (success) {
      // Reload the passkeys list
      const passkeys = await passkeyService.getUserPasskeys(email);
      return { passkeyId, passkeys };
    }
    throw new Error('Failed to remove passkey');
  }
);

export const checkHasPasskeys = createAsyncThunk(
  'passkey/checkHas',
  async (email: string) => {
    return await passkeyService.hasPasskeys(email);
  }
);

// New Android-specific async thunks
export const checkAndroidCapabilities = createAsyncThunk(
  'passkey/checkAndroidCapabilities',
  async () => {
    const capabilities = await passkeyService.getAndroidCapabilities();
    const securityLevel = capabilities?.securityLevel || null;
    
    const availableBiometrics: string[] = [];
    if (capabilities?.biometricCapabilities?.fingerprint) availableBiometrics.push('fingerprint');
    if (capabilities?.biometricCapabilities?.faceUnlock) availableBiometrics.push('face');
    if (capabilities?.biometricCapabilities?.iris) availableBiometrics.push('iris');
    
    return {
      capabilities,
      securityLevel,
      availableBiometrics,
      isAndroidDevice: capabilities !== null,
    };
  }
);

export const enrollAndroidBiometric = createAsyncThunk(
  'passkey/enrollAndroidBiometric',
  async ({ email, displayName, biometricType }: { 
    email: string; 
    displayName: string; 
    biometricType: 'fingerprint' | 'face' | 'iris' 
  }, { dispatch }) => {
    dispatch(setBiometricEnrollmentState({ 
      isEnrolling: true, 
      enrollmentType: biometricType 
    }));
    
    try {
      const result = await passkeyService.createAndroidPasskey(email, displayName, biometricType);
      
      dispatch(setBiometricEnrollmentState({ 
        isEnrolling: false, 
        success: true 
      }));
      
      return result;
    } catch (error) {
      dispatch(setBiometricEnrollmentState({ 
        isEnrolling: false, 
        error: error instanceof Error ? error.message : 'Enrollment failed' 
      }));
      throw error;
    }
  }
);

export const authenticateAndroidBiometric = createAsyncThunk(
  'passkey/authenticateAndroidBiometric',
  async ({ email, credentialId }: { email: string; credentialId?: string }) => {
    return await passkeyService.authenticateWithAndroidBiometric(email, credentialId);
  }
);

export const checkAndroidBiometricPasskeys = createAsyncThunk(
  'passkey/checkAndroidBiometricPasskeys',
  async (email: string) => {
    const hasAndroidBiometric = await passkeyService.hasAndroidBiometricPasskeys(email);
    const passkeys = await passkeyService.getUserPasskeys(email);
    
    const enrolledBiometrics: string[] = [];
    passkeys.forEach((p: any) => {
      if (p.biometricType && !enrolledBiometrics.includes(p.biometricType)) {
        enrolledBiometrics.push(p.biometricType);
      }
    });
    
    return {
      hasAndroidBiometric,
      enrolledBiometrics,
    };
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
    setRegistrationStep: (state, action: PayloadAction<PasskeyState['registrationStep']>) => {
      state.registrationStep = action.payload;
    },
    setAuthenticationStep: (state, action: PayloadAction<PasskeyState['authenticationStep']>) => {
      state.authenticationStep = action.payload;
    },
    resetSteps: (state) => {
      state.registrationStep = 'idle';
      state.authenticationStep = 'idle';
    },
    setBiometricEnrollmentState: (state, action: PayloadAction<Partial<BiometricEnrollmentState>>) => {
      state.biometricEnrollment = { ...state.biometricEnrollment, ...action.payload };
    },
    setAndroidCapabilities: (state, action: PayloadAction<AndroidDeviceInfo | null>) => {
      state.androidCapabilities = action.payload;
    },
    setSecurityLevel: (state, action: PayloadAction<'LOW' | 'MEDIUM' | 'HIGH' | null>) => {
      state.securityLevel = action.payload;
    },
    setAvailableBiometrics: (state, action: PayloadAction<string[]>) => {
      state.availableBiometrics = action.payload;
    },
    setEnrolledBiometrics: (state, action: PayloadAction<string[]>) => {
      state.enrolledBiometrics = action.payload;
    },
    resetBiometricEnrollment: (state) => {
      state.biometricEnrollment = { isEnrolling: false };
    },
  },
  extraReducers: (builder) => {
    builder
      // Check support
      .addCase(checkPasskeySupport.fulfilled, (state, action) => {
        state.isSupported = action.payload.isSupported;
        state.isAutofillSupported = action.payload.isAutofillSupported;
      })
      
      // Registration
      .addCase(registerPasskey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPasskey.fulfilled, (state, action) => {
        state.loading = false;
        state.isRegistered = true;
        if (action.payload.device) {
          state.devices.push(action.payload.device);
        }
      })
      .addCase(registerPasskey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
        state.registrationStep = 'idle';
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
        state.authenticationStep = 'idle';
      })
      
      // Load user passkeys
      .addCase(loadUserPasskeys.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserPasskeys.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
        state.isRegistered = action.payload.length > 0;
      })
      .addCase(loadUserPasskeys.rejected, (state) => {
        state.loading = false;
        state.devices = [];
      })
      
      // Remove passkey
      .addCase(removePasskey.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d.id !== action.payload.passkeyId);
        if (state.devices.length === 0) {
          state.isRegistered = false;
        }
      })
      
      // Check has passkeys
      .addCase(checkHasPasskeys.fulfilled, (state, action) => {
        state.isRegistered = action.payload;
      })
      
      // Android capabilities
      .addCase(checkAndroidCapabilities.fulfilled, (state, action) => {
        state.androidCapabilities = action.payload.capabilities;
        state.securityLevel = action.payload.securityLevel;
        state.availableBiometrics = action.payload.availableBiometrics;
        state.isAndroidDevice = action.payload.isAndroidDevice;
      })
      .addCase(checkAndroidCapabilities.rejected, (state) => {
        state.androidCapabilities = null;
        state.isAndroidDevice = false;
      })
      
      // Android biometric enrollment
      .addCase(enrollAndroidBiometric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollAndroidBiometric.fulfilled, (state, action) => {
        state.loading = false;
        state.isRegistered = true;
        if (action.payload.device) {
          state.devices.push(action.payload.device);
        }
      })
      .addCase(enrollAndroidBiometric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Android biometric enrollment failed';
      })
      
      // Android biometric authentication
      .addCase(authenticateAndroidBiometric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticateAndroidBiometric.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(authenticateAndroidBiometric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Android biometric authentication failed';
      })
      
      // Check Android biometric passkeys
      .addCase(checkAndroidBiometricPasskeys.fulfilled, (state, action) => {
        state.enrolledBiometrics = action.payload.enrolledBiometrics;
      });
  },
});

export const { 
  setSupported, 
  clearError, 
  addDevice, 
  removeDevice,
  setRegistrationStep,
  setAuthenticationStep,
  resetSteps,
  setBiometricEnrollmentState,
  setAndroidCapabilities,
  setSecurityLevel,
  setAvailableBiometrics,
  setEnrolledBiometrics,
  resetBiometricEnrollment,
} = passkeySlice.actions;

export default passkeySlice.reducer;
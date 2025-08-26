import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  registerPasskey,
  authenticateWithPasskey,
  checkPasskeySupport
} from '../../store/slices/passkeySlice';
import { deviceBiometricService, DeviceBiometricInfo } from '../../services/deviceBiometricService';
import { passkeyService } from '../../services/passkeyService';

interface DeviceSpecificBiometricSetupProps {
  email: string;
  displayName: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  mode?: 'register' | 'authenticate';
}

export const DeviceSpecificBiometricSetup: React.FC<DeviceSpecificBiometricSetupProps> = ({
  email,
  displayName,
  onSuccess,
  onError,
  mode = 'register',
}) => {
  const dispatch = useDispatch();
  const { loading, error, registrationStep, authenticationStep } = useSelector((state: RootState) => state.passkey);
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceBiometricInfo | null>(null);
  const [primaryBiometric, setPrimaryBiometric] = useState<{ type: string; name: string; icon: string } | null>(null);
  const [loadingDeviceInfo, setLoadingDeviceInfo] = useState(true);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        setLoadingDeviceInfo(true);
        
        // Get comprehensive device biometric information
        const info = await deviceBiometricService.getDeviceBiometricInfo();
        setDeviceInfo(info);
        
        // Get primary biometric method
        const primary = await passkeyService.getPrimaryBiometricMethod();
        setPrimaryBiometric(primary);
        
        // Check passkey support
        dispatch(checkPasskeySupport() as any);
        
      } catch (error) {
        console.error('Failed to load device info:', error);
      } finally {
        setLoadingDeviceInfo(false);
      }
    };

    loadDeviceInfo();
  }, [dispatch]);

  const handleRegister = async () => {
    try {
      const result = await dispatch(registerPasskey({ email, displayName }) as any);
      onSuccess?.(result.payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      onError?.(errorMessage);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const result = await dispatch(authenticateWithPasskey(email) as any);
      onSuccess?.(result.payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      onError?.(errorMessage);
    }
  };

  const getStepMessage = () => {
    if (mode === 'register') {
      switch (registrationStep) {
        case 'started':
          return 'Starting biometric setup...';
        case 'prompting':
          return primaryBiometric 
            ? `Please use your ${primaryBiometric.name} when prompted`
            : 'Please follow the biometric prompt';
        case 'verifying':
          return 'Verifying your biometric data...';
        case 'completed':
          return `${primaryBiometric?.name || 'Biometric'} setup completed!`;
        default:
          return '';
      }
    } else {
      switch (authenticationStep) {
        case 'started':
          return 'Starting authentication...';
        case 'prompting':
          return primaryBiometric 
            ? `Please use your ${primaryBiometric.name} to sign in`
            : 'Please follow the biometric prompt';
        case 'verifying':
          return 'Verifying your identity...';
        case 'completed':
          return 'Authentication successful!';
        default:
          return '';
      }
    }
  };

  const getBiometricInstructions = () => {
    if (!primaryBiometric) return '';

    const { type, name } = primaryBiometric;
    
    switch (type) {
      case 'face-id':
        return `Look at your device to use ${name}. Position your face in front of the camera and wait for recognition.`;
      case 'touch-id':
        return `Place your finger on the ${name} sensor. Keep your finger on the sensor until you feel a vibration or see a checkmark.`;
      case 'fingerprint':
        return `Place your finger on the fingerprint sensor. Keep it steady until the scan is complete.`;
      case 'face-unlock':
        return `Look at your device to use Face Unlock. Make sure you're in good lighting and facing the camera directly.`;
      case 'iris':
        return `Look at the iris scanner. Hold your device 8-12 inches from your face and keep your eyes open.`;
      case 'windows-hello-face':
        return `Look at your camera to use Windows Hello Face recognition.`;
      case 'windows-hello-fingerprint':
        return `Place your finger on the Windows Hello fingerprint reader.`;
      default:
        return `Use your device's biometric authentication when prompted.`;
    }
  };

  if (loadingDeviceInfo) {
    return (
      <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!deviceInfo) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Device Detection Failed</h3>
        <p className="text-red-700">Unable to detect device biometric capabilities.</p>
      </div>
    );
  }

  const availableBiometrics = deviceInfo.biometrics.methods.filter(method => method.supported);

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm space-y-6">
      {/* Header with device-specific title */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center">
          {primaryBiometric?.icon || '🔐'} 
          <span className="ml-2">
            {mode === 'register' ? 'Set up' : 'Sign in with'} {primaryBiometric?.name || 'Biometric Authentication'}
          </span>
        </h3>
        <p className="text-gray-600">
          {deviceInfo.deviceModel || deviceInfo.deviceName} • {deviceInfo.platform}
        </p>
      </div>

      {/* Device Information Card */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3 flex items-center">
          📱 <span className="ml-2">Device Information</span>
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Device:</strong> {deviceInfo.deviceModel || deviceInfo.deviceName}</p>
            <p><strong>Platform:</strong> {deviceInfo.platform}</p>
            <p><strong>Browser:</strong> {deviceInfo.browser}</p>
          </div>
          <div>
            <p><strong>Type:</strong> {deviceInfo.deviceType}</p>
            <p><strong>Family:</strong> {deviceInfo.deviceFamily || 'Unknown'}</p>
            <p><strong>WebAuthn:</strong> {deviceInfo.webauthn.supported ? '✅ Supported' : '❌ Not supported'}</p>
          </div>
        </div>
      </div>

      {/* Available Biometric Methods */}
      {availableBiometrics.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-blue-800">Available Biometric Methods</h4>
          <div className="grid grid-cols-1 gap-3">
            {availableBiometrics.map((method) => (
              <div 
                key={method.type}
                className={`flex items-center justify-between p-3 bg-white rounded border ${
                  method.type === primaryBiometric?.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      {method.hardwareBacked && <span className="text-green-600">🔒 Hardware-backed</span>}
                      <span className="capitalize">{method.securityLevel} security</span>
                    </div>
                  </div>
                </div>
                {method.type === primaryBiometric?.type && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">Primary</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {primaryBiometric && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
            💡 <span className="ml-2">How to use {primaryBiometric.name}</span>
          </h4>
          <p className="text-yellow-700 text-sm">{getBiometricInstructions()}</p>
        </div>
      )}

      {/* Status Messages */}
      {(loading || registrationStep !== 'idle' || authenticationStep !== 'idle') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="font-medium text-blue-800">{getStepMessage()}</p>
              <p className="text-blue-600 text-sm mt-1">Please don't close this window</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">❌ Error</h4>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={mode === 'register' ? handleRegister : handleAuthenticate}
          disabled={loading || !deviceInfo.webauthn.supported}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
            loading || !deviceInfo.webauthn.supported
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {mode === 'register' ? 'Setting up...' : 'Signing in...'}
            </div>
          ) : (
            <div className="flex items-center">
              {primaryBiometric?.icon && <span className="mr-2">{primaryBiometric.icon}</span>}
              {mode === 'register' ? `Set up ${primaryBiometric?.name || 'Biometric'}` : `Sign in with ${primaryBiometric?.name || 'Biometric'}`}
            </div>
          )}
        </button>
      </div>

      {/* Fallback Options */}
      {deviceInfo.biometrics.fallbackMethods && deviceInfo.biometrics.fallbackMethods.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          <p>Alternative options: {deviceInfo.biometrics.fallbackMethods.join(', ')}</p>
        </div>
      )}

      {/* WebAuthn Not Supported Warning */}
      {!deviceInfo.webauthn.supported && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-orange-800 mb-2">⚠️ Limited Support</h4>
          <p className="text-orange-700 text-sm">
            Your current browser doesn't fully support WebAuthn passkeys. Please try using a supported browser like Chrome, Safari, or Edge.
          </p>
        </div>
      )}
    </div>
  );
};
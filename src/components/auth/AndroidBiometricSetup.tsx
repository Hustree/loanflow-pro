import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  checkAndroidCapabilities, 
  enrollAndroidBiometric,
  checkAndroidBiometricPasskeys 
} from '../../store/slices/passkeySlice';

interface AndroidBiometricSetupProps {
  email: string;
  displayName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const AndroidBiometricSetup: React.FC<AndroidBiometricSetupProps> = ({
  email,
  displayName,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch();
  const {
    androidCapabilities,
    isAndroidDevice,
    availableBiometrics,
    enrolledBiometrics,
    biometricEnrollment,
    securityLevel,
    loading,
    error
  } = useSelector((state: RootState) => state.passkey);

  const [selectedBiometric, setSelectedBiometric] = useState<'fingerprint' | 'face' | 'iris'>('fingerprint');

  useEffect(() => {
    dispatch(checkAndroidCapabilities() as any);
    if (email) {
      dispatch(checkAndroidBiometricPasskeys(email) as any);
    }
  }, [dispatch, email]);

  const handleEnrollBiometric = async () => {
    try {
      await dispatch(enrollAndroidBiometric({ 
        email, 
        displayName, 
        biometricType: selectedBiometric 
      }) as any);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enrollment failed';
      onError?.(errorMessage);
    }
  };

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return '👆';
      case 'face': return '😊';
      case 'iris': return '👁️';
      default: return '🔐';
    }
  };

  const getSecurityLevelColor = (level: string | null) => {
    switch (level) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSecurityLevelText = (level: string | null) => {
    switch (level) {
      case 'HIGH': return 'High Security (Hardware-backed)';
      case 'MEDIUM': return 'Medium Security';
      case 'LOW': return 'Basic Security';
      default: return 'Security level unknown';
    }
  };

  if (!isAndroidDevice) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Biometric Authentication</h3>
        <p className="text-gray-600">
          Android biometric authentication is not available on this device.
        </p>
      </div>
    );
  }

  if (loading && !androidCapabilities) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Checking Android Capabilities...</h3>
        <div className="animate-pulse">Loading biometric information...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        🤖 Android Biometric Setup
      </h3>

      {/* Device Information */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Device Information</h4>
        <div className="text-sm space-y-1">
          <p><strong>Android Version:</strong> {androidCapabilities?.androidVersion || 'Unknown'}</p>
          <p><strong>API Level:</strong> {androidCapabilities?.apiLevel || 'Unknown'}</p>
          <p><strong>Security Level:</strong> 
            <span className={`ml-1 ${getSecurityLevelColor(securityLevel)}`}>
              {getSecurityLevelText(securityLevel)}
            </span>
          </p>
          <p><strong>Hardware Backed:</strong> {androidCapabilities?.hardwareBacked ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      {/* Available Biometrics */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Available Biometric Methods</h4>
        {availableBiometrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {availableBiometrics.map((biometric) => (
              <button
                key={biometric}
                onClick={() => setSelectedBiometric(biometric as any)}
                className={`p-3 border rounded-lg text-center transition-all ${
                  selectedBiometric === biometric
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{getBiometricIcon(biometric)}</div>
                <div className="text-sm font-medium capitalize">{biometric}</div>
                {enrolledBiometrics.includes(biometric) && (
                  <div className="text-xs text-green-600 mt-1">✓ Enrolled</div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No biometric methods available on this device.</p>
        )}
      </div>

      {/* Enrollment Status */}
      {biometricEnrollment.isEnrolling && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400">
          <p className="text-blue-800">
            🔄 Enrolling {biometricEnrollment.enrollmentType}... Please follow the on-screen prompts.
          </p>
        </div>
      )}

      {biometricEnrollment.success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400">
          <p className="text-green-800">
            ✅ Biometric enrollment successful! You can now use biometrics to sign in.
          </p>
        </div>
      )}

      {(biometricEnrollment.error || error) && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-800">
            ❌ {biometricEnrollment.error || error}
          </p>
        </div>
      )}

      {/* Enroll Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Select a biometric method and click enroll
        </div>
        <button
          onClick={handleEnrollBiometric}
          disabled={loading || !selectedBiometric || availableBiometrics.length === 0}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            loading || !selectedBiometric || availableBiometrics.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Enrolling...' : `Enroll ${selectedBiometric}`}
        </button>
      </div>

      {/* Android-specific Information */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <h5 className="font-medium text-blue-800 mb-1">Android Biometric Features:</h5>
        <ul className="text-blue-700 space-y-1">
          <li>• Native Android biometric prompts</li>
          <li>• Hardware-backed security when available</li>
          <li>• Fallback to device PIN/Pattern/Password</li>
          <li>• Seamless integration with WebAuthn passkeys</li>
        </ul>
      </div>
    </div>
  );
};
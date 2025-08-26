import React, { useEffect, useState } from 'react';
import { AndroidBiometricSetup } from '../auth/AndroidBiometricSetup';
import { androidBiometricService } from '../../services/androidBiometricService';
import { passkeyService } from '../../services/passkeyService';

export const AndroidBiometricDemo: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail] = useState('demo@psslai.com');
  const [displayName] = useState('Demo User');

  useEffect(() => {
    const checkDevice = async () => {
      setLoading(true);
      
      try {
        // Check if it's an Android device
        const isAndroid = androidBiometricService.isAndroidDevice();
        setIsAndroidDevice(isAndroid);

        if (isAndroid) {
          // Get Android capabilities
          const androidCapabilities = await androidBiometricService.checkBiometricCapabilities();
          setDeviceInfo(androidCapabilities);
        } else {
          // Get basic device info for non-Android devices
          const basicInfo = passkeyService.getDeviceInfo();
          setDeviceInfo(basicInfo);
        }
      } catch (error) {
        console.error('Failed to get device info:', error);
      } finally {
        setLoading(false);
      }
    };

    checkDevice();
  }, []);

  const simulateAndroidDevice = () => {
    // For demonstration purposes, simulate Android capabilities
    const mockAndroidInfo = {
      deviceType: 'mobile' as const,
      browser: 'Chrome',
      os: 'Android',
      deviceName: 'Chrome on Android (Demo)',
      androidVersion: '13',
      apiLevel: 33,
      biometricCapabilities: {
        fingerprint: true,
        faceUnlock: true,
        iris: false,
        strongBiometrics: true,
        weakBiometrics: true,
        convenienceBiometrics: true,
      },
      securityLevel: 'HIGH' as const,
      biometricEnrolled: true,
      fallbackMethods: ['PIN', 'PATTERN', 'PASSWORD'],
      hardwareBacked: true,
    };
    
    setDeviceInfo(mockAndroidInfo);
    setIsAndroidDevice(true);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Android Biometric Detection Demo</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Android Biometric Detection Demo</h1>
        <p className="text-gray-600">
          Automatic detection of Android biometric capabilities (Face ID equivalent for Android)
        </p>
      </div>

      {/* Device Detection Results */}
      <div className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📱 Device Detection Results
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Basic Device Info</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Device Type:</strong> {deviceInfo?.deviceType || 'Unknown'}</p>
              <p><strong>Browser:</strong> {deviceInfo?.browser || 'Unknown'}</p>
              <p><strong>OS:</strong> {deviceInfo?.os || 'Unknown'}</p>
              <p><strong>Device Name:</strong> {deviceInfo?.deviceName || 'Unknown'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Android Detection</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Is Android:</strong> {isAndroidDevice ? '✅ Yes' : '❌ No'}</p>
              {isAndroidDevice && (
                <>
                  <p><strong>Android Version:</strong> {deviceInfo?.androidVersion || 'Unknown'}</p>
                  <p><strong>API Level:</strong> {deviceInfo?.apiLevel || 'Unknown'}</p>
                  <p><strong>Security Level:</strong> {deviceInfo?.securityLevel || 'Unknown'}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {isAndroidDevice && deviceInfo?.biometricCapabilities && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Biometric Capabilities</h3>
            <div className="bg-blue-50 p-4 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl mb-1">👆</div>
                  <div className="font-medium">Fingerprint</div>
                  <div className={deviceInfo.biometricCapabilities.fingerprint ? 'text-green-600' : 'text-gray-400'}>
                    {deviceInfo.biometricCapabilities.fingerprint ? '✓ Available' : '✗ Not Available'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <div className="font-medium">Face Unlock</div>
                  <div className={deviceInfo.biometricCapabilities.faceUnlock ? 'text-green-600' : 'text-gray-400'}>
                    {deviceInfo.biometricCapabilities.faceUnlock ? '✓ Available' : '✗ Not Available'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">👁️</div>
                  <div className="font-medium">Iris Scan</div>
                  <div className={deviceInfo.biometricCapabilities.iris ? 'text-green-600' : 'text-gray-400'}>
                    {deviceInfo.biometricCapabilities.iris ? '✓ Available' : '✗ Not Available'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="font-medium">Strong Auth</div>
                  <div className={deviceInfo.biometricCapabilities.strongBiometrics ? 'text-green-600' : 'text-gray-400'}>
                    {deviceInfo.biometricCapabilities.strongBiometrics ? '✓ Available' : '✗ Not Available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAndroidDevice && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="font-medium text-yellow-800 mb-2">Non-Android Device Detected</h3>
            <p className="text-yellow-700 mb-3">
              This demo is designed to show Android biometric detection. You're currently on a {deviceInfo?.os || 'non-Android'} device.
            </p>
            <button
              onClick={simulateAndroidDevice}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🤖 Simulate Android Device for Demo
            </button>
          </div>
        )}
      </div>

      {/* Android Biometric Setup Component */}
      {isAndroidDevice && (
        <AndroidBiometricSetup
          email={userEmail}
          displayName={displayName}
          onSuccess={() => {
            alert('✅ Android biometric setup successful!');
          }}
          onError={(error) => {
            alert(`❌ Setup failed: ${error}`);
          }}
        />
      )}

      {/* Implementation Notes */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Implementation Notes</h2>
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium mb-1">✨ Auto-Detection Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Automatically detects Android devices using User Agent and platform checks</li>
              <li>Extracts Android version and maps to API levels for capability assessment</li>
              <li>Identifies available biometric methods (fingerprint, face, iris)</li>
              <li>Determines security levels (LOW/MEDIUM/HIGH) based on hardware capabilities</li>
              <li>Detects hardware-backed security features</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">🔄 Integration Points</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Seamlessly integrates with existing WebAuthn/Passkey infrastructure</li>
              <li>Extends current Redux state management for Android-specific features</li>
              <li>Works with mock API for development and testing</li>
              <li>Falls back gracefully on non-Android devices</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-1">🚀 Production Ready</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Follows the PRD specifications for Android biometric support</li>
              <li>Compatible with Android 9+ (API 28+) with graceful degradation</li>
              <li>TypeScript support with proper type definitions</li>
              <li>Error handling and fallback mechanisms included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
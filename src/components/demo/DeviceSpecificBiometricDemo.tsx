import React, { useEffect, useState } from 'react';
import { DeviceSpecificBiometricSetup } from '../auth/DeviceSpecificBiometricSetup';
import { deviceBiometricService, DeviceBiometricInfo } from '../../services/deviceBiometricService';

export const DeviceSpecificBiometricDemo: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceBiometricInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail] = useState('demo@psslai.com');
  const [displayName] = useState('Demo User');
  const [mode, setMode] = useState<'register' | 'authenticate'>('register');

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        setLoading(true);
        const info = await deviceBiometricService.getDeviceBiometricInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('Failed to get device info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeviceInfo();
  }, []);

  const simulateDevice = (deviceType: 'iphone-face-id' | 'iphone-touch-id' | 'android-pixel' | 'android-galaxy' | 'ipad-face-id' | 'macbook-touch-id') => {
    let mockInfo: DeviceBiometricInfo;

    switch (deviceType) {
      case 'iphone-face-id':
        mockInfo = {
          deviceType: 'mobile',
          platform: 'iOS',
          browser: 'Safari',
          deviceName: 'iPhone 15 Pro (Safari)',
          deviceModel: 'iPhone 15 Pro',
          deviceFamily: 'iPhone',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'face-id',
                name: 'Face ID',
                icon: '🆔',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              }
            ],
            primaryMethod: 'face-id',
            fallbackMethods: ['device-passcode'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
            autofillSupported: true,
          },
        };
        break;

      case 'iphone-touch-id':
        mockInfo = {
          deviceType: 'mobile',
          platform: 'iOS',
          browser: 'Safari',
          deviceName: 'iPhone 8 (Safari)',
          deviceModel: 'iPhone 8',
          deviceFamily: 'iPhone',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'touch-id',
                name: 'Touch ID',
                icon: '👆',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              }
            ],
            primaryMethod: 'touch-id',
            fallbackMethods: ['device-passcode'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
          },
        };
        break;

      case 'android-pixel':
        mockInfo = {
          deviceType: 'mobile',
          platform: 'Android',
          browser: 'Chrome',
          deviceName: 'Pixel 7 Pro (Chrome)',
          deviceModel: 'Pixel 7 Pro',
          deviceFamily: 'Pixel',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'fingerprint',
                name: 'Fingerprint Scanner',
                icon: '👆',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              },
              {
                type: 'face-unlock',
                name: 'Face Unlock',
                icon: '😊',
                supported: true,
                enrolled: true,
                hardwareBacked: false,
                securityLevel: 'weak',
              }
            ],
            primaryMethod: 'fingerprint',
            fallbackMethods: ['pin', 'pattern', 'password'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
          },
        };
        break;

      case 'android-galaxy':
        mockInfo = {
          deviceType: 'mobile',
          platform: 'Android',
          browser: 'Chrome',
          deviceName: 'Galaxy S23 Ultra (Chrome)',
          deviceModel: 'SM-S918U',
          deviceFamily: 'Galaxy',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'fingerprint',
                name: 'Fingerprint Scanner',
                icon: '👆',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              },
              {
                type: 'face-unlock',
                name: 'Face Recognition',
                icon: '😊',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              }
            ],
            primaryMethod: 'fingerprint',
            fallbackMethods: ['pin', 'pattern', 'password'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
          },
        };
        break;

      case 'ipad-face-id':
        mockInfo = {
          deviceType: 'tablet',
          platform: 'iOS',
          browser: 'Safari',
          deviceName: 'iPad Pro 12.9-inch (Safari)',
          deviceModel: 'iPad Pro 12.9-inch',
          deviceFamily: 'iPad',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'face-id',
                name: 'Face ID',
                icon: '🆔',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              }
            ],
            primaryMethod: 'face-id',
            fallbackMethods: ['device-passcode'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
          },
        };
        break;

      case 'macbook-touch-id':
        mockInfo = {
          deviceType: 'desktop',
          platform: 'macOS',
          browser: 'Safari',
          deviceName: 'MacBook Pro (Safari)',
          deviceModel: 'MacBook Pro',
          deviceFamily: 'Mac',
          biometrics: {
            available: true,
            methods: [
              {
                type: 'touch-id',
                name: 'Touch ID',
                icon: '👆',
                supported: true,
                enrolled: true,
                hardwareBacked: true,
                securityLevel: 'strong',
              }
            ],
            primaryMethod: 'touch-id',
            fallbackMethods: ['system-password'],
          },
          webauthn: {
            supported: true,
            platformAuthenticator: true,
            userVerifyingPlatformAuthenticator: true,
          },
        };
        break;

      default:
        return;
    }

    setDeviceInfo(mockInfo);
  };

  if (loading && !deviceInfo) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Device-Specific Biometric Labels Demo</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentDevice = deviceInfo;
  const primaryBiometric = currentDevice?.biometrics.methods.find(m => m.type === currentDevice.biometrics.primaryMethod);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📱 Device-Specific Biometric Labels</h1>
        <p className="text-xl text-gray-600 mb-2">
          Accurate biometric detection with proper device-specific names
        </p>
        <p className="text-gray-500">
          Shows "Face ID" for iPhone, "Touch ID" for older devices, and proper Android labels
        </p>
      </div>

      {/* Current Device Detection */}
      <div className="bg-white border rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          🔍 <span className="ml-2">Current Device Detection</span>
        </h2>
        
        {currentDevice && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Device Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Model:</strong> {currentDevice.deviceModel || 'Unknown'}</p>
                <p><strong>Family:</strong> {currentDevice.deviceFamily || 'Unknown'}</p>
                <p><strong>Platform:</strong> {currentDevice.platform}</p>
                <p><strong>Type:</strong> {currentDevice.deviceType}</p>
                <p><strong>Browser:</strong> {currentDevice.browser}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Biometric Capabilities</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                {currentDevice.biometrics.methods.map((method) => (
                  <div key={method.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{method.icon}</span>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-gray-600">{method.securityLevel} security</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      method.supported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {method.supported ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                ))}
                
                {primaryBiometric && (
                  <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                    <strong>Primary Method:</strong> {primaryBiometric.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">WebAuthn Support</h3>
              <div className="bg-green-50 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>WebAuthn:</strong> {currentDevice.webauthn.supported ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Platform Auth:</strong> {currentDevice.webauthn.platformAuthenticator ? '✅ Yes' : '❌ No'}</p>
                <p><strong>User Verification:</strong> {currentDevice.webauthn.userVerifyingPlatformAuthenticator ? '✅ Yes' : '❌ No'}</p>
                {currentDevice.webauthn.autofillSupported !== undefined && (
                  <p><strong>Autofill:</strong> {currentDevice.webauthn.autofillSupported ? '✅ Yes' : '❌ No'}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device Simulation Buttons */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">🧪 Test Different Devices</h2>
        <p className="text-gray-600 mb-4">Click any device below to see how the labels change</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => simulateDevice('iphone-face-id')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🆔</div>
            <div className="font-medium text-sm">iPhone 15</div>
            <div className="text-xs text-gray-600">Face ID</div>
          </button>

          <button
            onClick={() => simulateDevice('iphone-touch-id')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👆</div>
            <div className="font-medium text-sm">iPhone 8</div>
            <div className="text-xs text-gray-600">Touch ID</div>
          </button>

          <button
            onClick={() => simulateDevice('android-pixel')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👆</div>
            <div className="font-medium text-sm">Pixel 7</div>
            <div className="text-xs text-gray-600">Fingerprint</div>
          </button>

          <button
            onClick={() => simulateDevice('android-galaxy')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">😊</div>
            <div className="font-medium text-sm">Galaxy S23</div>
            <div className="text-xs text-gray-600">Face Recognition</div>
          </button>

          <button
            onClick={() => simulateDevice('ipad-face-id')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🆔</div>
            <div className="font-medium text-sm">iPad Pro</div>
            <div className="text-xs text-gray-600">Face ID</div>
          </button>

          <button
            onClick={() => simulateDevice('macbook-touch-id')}
            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👆</div>
            <div className="font-medium text-sm">MacBook</div>
            <div className="text-xs text-gray-600">Touch ID</div>
          </button>
        </div>
      </div>

      {/* Interactive Biometric Setup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">🔐 Interactive Biometric Setup</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('register')}
              className={`px-4 py-2 rounded font-medium ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Registration
            </button>
            <button
              onClick={() => setMode('authenticate')}
              className={`px-4 py-2 rounded font-medium ${
                mode === 'authenticate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Authentication
            </button>
          </div>
        </div>

        <DeviceSpecificBiometricSetup
          email={userEmail}
          displayName={displayName}
          mode={mode}
          onSuccess={(result) => {
            alert(`✅ ${mode === 'register' ? 'Registration' : 'Authentication'} successful!`);
            console.log('Success result:', result);
          }}
          onError={(error) => {
            alert(`❌ ${mode === 'register' ? 'Registration' : 'Authentication'} failed: ${error}`);
          }}
        />
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900">✨ Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg text-blue-800 mb-3">📱 Device-Specific Detection</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• <strong>iPhone X+:</strong> Shows "Face ID" with face emoji 🆔</li>
              <li>• <strong>iPhone 5s-8:</strong> Shows "Touch ID" with finger emoji 👆</li>
              <li>• <strong>Android:</strong> Shows "Fingerprint Scanner" or device-specific names</li>
              <li>• <strong>Samsung:</strong> Shows "Face Recognition" instead of generic "Face Unlock"</li>
              <li>• <strong>macOS:</strong> Shows "Touch ID" for MacBook Pro</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-blue-800 mb-3">🔒 Smart Integration</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Detects hardware-backed security levels</li>
              <li>• Shows appropriate fallback methods per platform</li>
              <li>• WebAuthn compatibility checking</li>
              <li>• Primary vs secondary biometric method detection</li>
              <li>• Platform-specific user instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
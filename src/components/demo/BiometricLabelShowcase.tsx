import React, { useEffect, useState } from 'react';
import { deviceBiometricService, DeviceBiometricInfo } from '../../services/deviceBiometricService';

interface DeviceExample {
  name: string;
  icon: string;
  platform: string;
  biometrics: Array<{
    name: string;
    icon: string;
    primary?: boolean;
  }>;
  description: string;
}

export const BiometricLabelShowcase: React.FC = () => {
  const [realDeviceInfo, setRealDeviceInfo] = useState<DeviceBiometricInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealDevice = async () => {
      try {
        const info = await deviceBiometricService.getDeviceBiometricInfo();
        setRealDeviceInfo(info);
      } catch (error) {
        console.error('Failed to get real device info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRealDevice();
  }, []);

  const deviceExamples: DeviceExample[] = [
    {
      name: 'iPhone 15 Pro',
      icon: '📱',
      platform: 'iOS',
      biometrics: [
        { name: 'Face ID', icon: '🆔', primary: true }
      ],
      description: 'Latest iPhone with TrueDepth camera system for secure Face ID authentication'
    },
    {
      name: 'iPhone 8 Plus',
      icon: '📱',
      platform: 'iOS',
      biometrics: [
        { name: 'Touch ID', icon: '👆', primary: true }
      ],
      description: 'Classic iPhone with home button featuring Touch ID fingerprint sensor'
    },
    {
      name: 'iPad Pro 12.9"',
      icon: '📱',
      platform: 'iOS',
      biometrics: [
        { name: 'Face ID', icon: '🆔', primary: true }
      ],
      description: 'Professional tablet with Face ID for landscape and portrait orientations'
    },
    {
      name: 'iPad (9th gen)',
      icon: '📱',
      platform: 'iOS',
      biometrics: [
        { name: 'Touch ID', icon: '👆', primary: true }
      ],
      description: 'Standard iPad with Touch ID integrated into the home button'
    },
    {
      name: 'Google Pixel 7 Pro',
      icon: '🤖',
      platform: 'Android',
      biometrics: [
        { name: 'Fingerprint Scanner', icon: '👆', primary: true },
        { name: 'Face Unlock', icon: '😊' }
      ],
      description: 'Google flagship with under-display fingerprint sensor and face unlock'
    },
    {
      name: 'Samsung Galaxy S23 Ultra',
      icon: '🤖',
      platform: 'Android',
      biometrics: [
        { name: 'Fingerprint Scanner', icon: '👆', primary: true },
        { name: 'Face Recognition', icon: '😊' }
      ],
      description: 'Samsung flagship with ultrasonic fingerprint sensor and 3D face recognition'
    },
    {
      name: 'OnePlus 11',
      icon: '🤖',
      platform: 'Android',
      biometrics: [
        { name: 'Fingerprint Scanner', icon: '👆', primary: true },
        { name: 'Face Unlock', icon: '😊' }
      ],
      description: 'OnePlus flagship with optical in-display fingerprint sensor'
    },
    {
      name: 'MacBook Pro',
      icon: '💻',
      platform: 'macOS',
      biometrics: [
        { name: 'Touch ID', icon: '👆', primary: true }
      ],
      description: 'Professional laptop with Touch ID integrated into the power button'
    }
  ];

  const getCurrentDeviceLabel = () => {
    if (!realDeviceInfo || !realDeviceInfo.biometrics.available) {
      return 'No biometric methods detected';
    }

    const primary = realDeviceInfo.biometrics.methods.find(
      m => m.type === realDeviceInfo.biometrics.primaryMethod && m.supported
    );

    if (primary) {
      return `${primary.icon} ${primary.name}`;
    }

    const firstSupported = realDeviceInfo.biometrics.methods.find(m => m.supported);
    if (firstSupported) {
      return `${firstSupported.icon} ${firstSupported.name}`;
    }

    return 'Biometric methods not supported';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🏷️ Accurate Biometric Labels</h1>
        <p className="text-xl text-gray-600 mb-2">
          Device-specific biometric authentication names
        </p>
        <p className="text-gray-500">
          No more generic "biometric" labels - shows exactly what users expect to see
        </p>
      </div>

      {/* Your Device */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900 flex items-center">
          📱 <span className="ml-2">Your Current Device</span>
        </h2>
        
        {loading ? (
          <div className="animate-pulse flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-200 rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-blue-200 rounded w-1/3"></div>
              <div className="h-3 bg-blue-200 rounded w-2/3"></div>
            </div>
          </div>
        ) : realDeviceInfo ? (
          <div className="flex items-center space-x-6">
            <div className="text-6xl">
              {realDeviceInfo.platform === 'iOS' ? '🍎' : 
               realDeviceInfo.platform === 'Android' ? '🤖' : 
               realDeviceInfo.platform === 'macOS' ? '🍎' : '💻'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-blue-900">
                {realDeviceInfo.deviceModel || realDeviceInfo.deviceName}
              </h3>
              <p className="text-blue-700 text-lg mb-2">{realDeviceInfo.platform} • {realDeviceInfo.browser}</p>
              <div className="text-2xl font-semibold text-blue-800">
                {getCurrentDeviceLabel()}
              </div>
              <p className="text-blue-600 text-sm mt-2">
                WebAuthn Support: {realDeviceInfo.webauthn.supported ? '✅ Full support' : '❌ Limited support'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-blue-700">Unable to detect device information</p>
        )}
      </div>

      {/* Device Examples Grid */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center">📚 Device-Specific Examples</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deviceExamples.map((device, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{device.icon}</div>
                <h3 className="text-lg font-bold">{device.name}</h3>
                <p className="text-sm text-gray-600">{device.platform}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Biometric Methods:</h4>
                {device.biometrics.map((biometric, bIndex) => (
                  <div key={bIndex} className={`flex items-center justify-between p-2 rounded ${biometric.primary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{biometric.icon}</span>
                      <span className="font-medium text-sm">{biometric.name}</span>
                    </div>
                    {biometric.primary && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium">Primary</span>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-600 mt-4 leading-relaxed">{device.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-green-500 p-1">
          <div className="bg-white p-6">
            <h2 className="text-3xl font-bold text-center mb-8">🔄 Before vs After Comparison</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-red-600 mb-4">❌ Before (Generic Labels)</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-semibold">iPhone 15 Pro</div>
                    <div className="text-gray-600">🔐 Biometric Authentication</div>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-semibold">iPhone 8</div>
                    <div className="text-gray-600">🔐 Biometric Authentication</div>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-semibold">Galaxy S23</div>
                    <div className="text-gray-600">🔐 Biometric Authentication</div>
                  </div>
                  
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-semibold">MacBook Pro</div>
                    <div className="text-gray-600">🔐 Biometric Authentication</div>
                  </div>
                </div>
                
                <div className="text-center text-red-600 font-medium">
                  Confusing for users - what exactly should they use?
                </div>
              </div>

              {/* After */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600 mb-4">✅ After (Device-Specific Labels)</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold">iPhone 15 Pro</div>
                    <div className="text-green-700 font-medium">🆔 Face ID</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold">iPhone 8</div>
                    <div className="text-green-700 font-medium">👆 Touch ID</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold">Galaxy S23</div>
                    <div className="text-green-700 font-medium">👆 Fingerprint Scanner</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold">MacBook Pro</div>
                    <div className="text-green-700 font-medium">👆 Touch ID</div>
                  </div>
                </div>
                
                <div className="text-center text-green-600 font-medium">
                  Clear and familiar - users know exactly what to use!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Implementation */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h2 className="text-3xl font-bold mb-6">🔧 Technical Implementation</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Detection Methods</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>User Agent Analysis:</strong> Parse device model and capabilities from navigator.userAgent
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>Platform Detection:</strong> Identify iOS, Android, macOS, Windows based on multiple signals
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>Model Mapping:</strong> Map device identifiers to specific biometric capabilities
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>WebAuthn Integration:</strong> Verify actual platform authenticator availability
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Label Mapping</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">📱</span>
                <div>
                  <strong>iPhone X+:</strong> "Face ID" with face emoji 🆔
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">📱</span>
                <div>
                  <strong>iPhone 5s-8:</strong> "Touch ID" with finger emoji 👆
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">🤖</span>
                <div>
                  <strong>Android:</strong> "Fingerprint Scanner" or device-specific names
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">💻</span>
                <div>
                  <strong>macOS:</strong> "Touch ID" for MacBook Pro with Touch Bar
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">🎯 User Experience Benefits</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Familiar Language</h3>
            <p className="text-gray-600 text-sm">
              Users see the exact same terminology they see in their device settings and other apps
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Faster Recognition</h3>
            <p className="text-gray-600 text-sm">
              No confusion about which biometric method to use - it's clearly labeled with the right name
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Trust & Confidence</h3>
            <p className="text-gray-600 text-sm">
              Professional presentation matches what users expect from banking and secure apps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
import { z } from 'zod';

// Enhanced device-specific biometric capabilities
export const DeviceBiometricInfoSchema = z.object({
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  platform: z.enum(['iOS', 'Android', 'macOS', 'Windows', 'Linux', 'Unknown']),
  browser: z.string(),
  deviceName: z.string(),
  
  // Specific device identification
  deviceModel: z.string().optional(),
  deviceFamily: z.string().optional(), // iPhone, iPad, Galaxy, Pixel, etc.
  
  // Platform-specific biometric info
  biometrics: z.object({
    available: z.boolean(),
    methods: z.array(z.object({
      type: z.string(), // 'face-id', 'touch-id', 'fingerprint', 'face-unlock', 'iris', 'voice'
      name: z.string(), // 'Face ID', 'Touch ID', 'Fingerprint Scanner', etc.
      icon: z.string(), // Emoji or icon identifier
      supported: z.boolean(),
      enrolled: z.boolean().optional(),
      hardwareBacked: z.boolean().optional(),
      securityLevel: z.enum(['convenience', 'weak', 'strong']).optional(),
    })),
    primaryMethod: z.string().optional(), // The main biometric method for this device
    fallbackMethods: z.array(z.string()).optional(),
  }),
  
  // WebAuthn support info
  webauthn: z.object({
    supported: z.boolean(),
    platformAuthenticator: z.boolean(),
    userVerifyingPlatformAuthenticator: z.boolean(),
    autofillSupported: z.boolean().optional(),
  }),
});

export type DeviceBiometricInfo = z.infer<typeof DeviceBiometricInfoSchema>;

interface BiometricMethod {
  type: string;
  name: string;
  icon: string;
  supported: boolean;
  enrolled?: boolean;
  hardwareBacked?: boolean;
  securityLevel?: 'convenience' | 'weak' | 'strong';
}

export class DeviceBiometricService {
  private static instance: DeviceBiometricService;
  
  private constructor() {}
  
  public static getInstance(): DeviceBiometricService {
    if (!DeviceBiometricService.instance) {
      DeviceBiometricService.instance = new DeviceBiometricService();
    }
    return DeviceBiometricService.instance;
  }

  // Main method to get comprehensive device biometric info
  async getDeviceBiometricInfo(): Promise<DeviceBiometricInfo> {
    const ua = navigator.userAgent;
    const platform = this.detectPlatform(ua);
    const deviceType = this.detectDeviceType(ua);
    const browser = this.detectBrowser(ua);
    const deviceModel = this.extractDeviceModel(ua, platform);
    const deviceFamily = this.extractDeviceFamily(ua, platform);
    const deviceName = this.generateDeviceName(browser, platform, deviceModel);

    // Get biometric capabilities based on platform
    const biometrics = await this.detectBiometricCapabilities(platform, deviceModel, ua);
    
    // Get WebAuthn support info
    const webauthn = await this.checkWebAuthnSupport();

    const deviceInfo = {
      deviceType,
      platform,
      browser,
      deviceName,
      deviceModel,
      deviceFamily,
      biometrics,
      webauthn,
    };

    return DeviceBiometricInfoSchema.parse(deviceInfo);
  }

  private detectPlatform(ua: string): 'iOS' | 'Android' | 'macOS' | 'Windows' | 'Linux' | 'Unknown' {
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  private detectDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
    if (/iPad|Android.*Tablet/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iPhone|iPod/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(ua: string): string {
    if (/Edg/i.test(ua)) return 'Edge';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Firefox/i.test(ua)) return 'Firefox';
    return 'Unknown';
  }

  private extractDeviceModel(ua: string, platform: string): string | undefined {
    switch (platform) {
      case 'iOS':
        return this.extractiOSModel(ua);
      case 'Android':
        return this.extractAndroidModel(ua);
      default:
        return undefined;
    }
  }

  private extractiOSModel(ua: string): string | undefined {
    // iPhone models
    if (/iPhone/i.test(ua)) {
      const patterns = [
        { pattern: /iPhone15,\d/, model: 'iPhone 15' },
        { pattern: /iPhone14,\d/, model: 'iPhone 14' },
        { pattern: /iPhone13,\d/, model: 'iPhone 13' },
        { pattern: /iPhone12,\d/, model: 'iPhone 12' },
        { pattern: /iPhone11,\d/, model: 'iPhone 11' },
        { pattern: /iPhone10,\d/, model: 'iPhone X' },
        { pattern: /iPhone9,[34]/, model: 'iPhone 7' },
        { pattern: /iPhone8,[12]/, model: 'iPhone 6s' },
        { pattern: /iPhone7,[12]/, model: 'iPhone 6' },
      ];

      for (const { pattern, model } of patterns) {
        if (pattern.test(ua)) {
          return model;
        }
      }
      return 'iPhone';
    }

    // iPad models
    if (/iPad/i.test(ua)) {
      if (/iPad13,\d/.test(ua)) return 'iPad Pro';
      if (/iPad11,\d/.test(ua)) return 'iPad Air';
      if (/iPad7,\d/.test(ua)) return 'iPad';
      return 'iPad';
    }

    return undefined;
  }

  private extractAndroidModel(ua: string): string | undefined {
    const patterns = [
      /Android.*?;\s*([^;)]+)\)/i,        // Standard Android pattern
      /(SM-[A-Z0-9]+)/i,                 // Samsung models
      /(Pixel [0-9]+[a-zA-Z]*)/i,        // Google Pixel
      /(Mi [A-Z0-9 ]+)/i,                // Xiaomi
      /(OnePlus [A-Z0-9]+)/i,            // OnePlus
      /(LG-[A-Z0-9]+)/i,                 // LG
    ];

    for (const pattern of patterns) {
      const match = ua.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractDeviceFamily(ua: string, platform: string): string | undefined {
    switch (platform) {
      case 'iOS':
        if (/iPhone/i.test(ua)) return 'iPhone';
        if (/iPad/i.test(ua)) return 'iPad';
        if (/iPod/i.test(ua)) return 'iPod';
        break;
      case 'Android':
        if (/SM-/i.test(ua)) return 'Galaxy';
        if (/Pixel/i.test(ua)) return 'Pixel';
        if (/Mi /i.test(ua)) return 'Xiaomi';
        if (/OnePlus/i.test(ua)) return 'OnePlus';
        if (/LG-/i.test(ua)) return 'LG';
        break;
    }
    return undefined;
  }

  private generateDeviceName(browser: string, platform: string, deviceModel?: string): string {
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    if (deviceModel) {
      return `${deviceModel} (${browser}) - ${date}`;
    }
    
    return `${browser} on ${platform} (${date})`;
  }

  private async detectBiometricCapabilities(
    platform: string, 
    deviceModel?: string, 
    ua?: string
  ): Promise<DeviceBiometricInfo['biometrics']> {
    const methods: BiometricMethod[] = [];
    let primaryMethod: string | undefined;

    switch (platform) {
      case 'iOS':
        methods.push(...await this.getiOSBiometrics(deviceModel, ua));
        primaryMethod = this.getiOSPrimaryMethod(deviceModel);
        break;
      case 'Android':
        methods.push(...await this.getAndroidBiometrics(deviceModel, ua));
        primaryMethod = this.getAndroidPrimaryMethod(deviceModel);
        break;
      case 'macOS':
        methods.push(...await this.getMacOSBiometrics());
        primaryMethod = 'touch-id';
        break;
      case 'Windows':
        methods.push(...await this.getWindowsBiometrics());
        break;
    }

    const available = methods.some(m => m.supported);
    const fallbackMethods = this.getFallbackMethods(platform);

    return {
      available,
      methods,
      primaryMethod,
      fallbackMethods,
    };
  }

  private async getiOSBiometrics(deviceModel?: string, ua?: string): Promise<BiometricMethod[]> {
    const methods: BiometricMethod[] = [];
    
    // Check WebAuthn platform authenticator support
    const platformAuthAvailable = await this.checkPlatformAuthenticator();

    // iPhone X and newer have Face ID
    const hasFaceID = this.iOSDeviceHasFaceID(deviceModel, ua);
    // iPhone 5s to iPhone 8 have Touch ID
    const hasTouchID = this.iOSDeviceHasTouchID(deviceModel, ua);

    if (hasFaceID) {
      methods.push({
        type: 'face-id',
        name: 'Face ID',
        icon: '🆔',
        supported: platformAuthAvailable,
        hardwareBacked: true,
        securityLevel: 'strong',
      });
    }

    if (hasTouchID) {
      methods.push({
        type: 'touch-id',
        name: 'Touch ID',
        icon: '👆',
        supported: platformAuthAvailable,
        hardwareBacked: true,
        securityLevel: 'strong',
      });
    }

    // iPad models
    if (/iPad/i.test(ua || '')) {
      const iPadHasFaceID = this.iPadHasFaceID(deviceModel);
      const iPadHasTouchID = this.iPadHasTouchID(deviceModel);

      if (iPadHasFaceID) {
        methods.push({
          type: 'face-id',
          name: 'Face ID',
          icon: '🆔',
          supported: platformAuthAvailable,
          hardwareBacked: true,
          securityLevel: 'strong',
        });
      } else if (iPadHasTouchID) {
        methods.push({
          type: 'touch-id',
          name: 'Touch ID',
          icon: '👆',
          supported: platformAuthAvailable,
          hardwareBacked: true,
          securityLevel: 'strong',
        });
      }
    }

    return methods;
  }

  private async getAndroidBiometrics(deviceModel?: string, ua?: string): Promise<BiometricMethod[]> {
    const methods: BiometricMethod[] = [];
    
    const platformAuthAvailable = await this.checkPlatformAuthenticator();

    // Most Android devices have fingerprint
    methods.push({
      type: 'fingerprint',
      name: 'Fingerprint Scanner',
      icon: '👆',
      supported: platformAuthAvailable,
      hardwareBacked: true,
      securityLevel: 'strong',
    });

    // Face unlock capability based on device model
    if (this.androidDeviceHasFaceUnlock(deviceModel, ua)) {
      const faceUnlockName = this.getAndroidFaceUnlockName(deviceModel);
      methods.push({
        type: 'face-unlock',
        name: faceUnlockName,
        icon: '😊',
        supported: platformAuthAvailable,
        hardwareBacked: this.androidFaceUnlockIsHardwareBacked(deviceModel),
        securityLevel: this.androidFaceUnlockSecurityLevel(deviceModel),
      });
    }

    // Iris scanning (mainly Samsung)
    if (this.androidDeviceHasIris(deviceModel)) {
      methods.push({
        type: 'iris',
        name: 'Iris Scanner',
        icon: '👁️',
        supported: platformAuthAvailable,
        hardwareBacked: true,
        securityLevel: 'strong',
      });
    }

    return methods;
  }

  private async getMacOSBiometrics(): Promise<BiometricMethod[]> {
    const platformAuthAvailable = await this.checkPlatformAuthenticator();

    return [{
      type: 'touch-id',
      name: 'Touch ID',
      icon: '👆',
      supported: platformAuthAvailable,
      hardwareBacked: true,
      securityLevel: 'strong',
    }];
  }

  private async getWindowsBiometrics(): Promise<BiometricMethod[]> {
    const platformAuthAvailable = await this.checkPlatformAuthenticator();

    return [
      {
        type: 'windows-hello-face',
        name: 'Windows Hello Face',
        icon: '😊',
        supported: platformAuthAvailable,
        hardwareBacked: true,
        securityLevel: 'strong',
      },
      {
        type: 'windows-hello-fingerprint',
        name: 'Windows Hello Fingerprint',
        icon: '👆',
        supported: platformAuthAvailable,
        hardwareBacked: true,
        securityLevel: 'strong',
      }
    ];
  }

  // iOS device capability detection
  private iOSDeviceHasFaceID(deviceModel?: string, ua?: string): boolean {
    if (!deviceModel && ua) {
      // iPhone X and newer have Face ID
      const faceIDPatterns = [
        /iPhone1[0-5],\d/,  // iPhone X, XS, XR, 11, 12, 13, 14, 15
      ];
      return faceIDPatterns.some(pattern => pattern.test(ua));
    }

    if (deviceModel) {
      const faceIDModels = [
        'iPhone X', 'iPhone XS', 'iPhone XR',
        'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'
      ];
      return faceIDModels.some(model => deviceModel.includes(model));
    }

    return false;
  }

  private iOSDeviceHasTouchID(deviceModel?: string, ua?: string): boolean {
    if (!deviceModel && ua) {
      // iPhone 5s to iPhone 8 have Touch ID
      const touchIDPatterns = [
        /iPhone[6-9],\d/,   // iPhone 5s, 6, 6s, 7, 8
      ];
      return touchIDPatterns.some(pattern => pattern.test(ua));
    }

    if (deviceModel) {
      const touchIDModels = [
        'iPhone 5s', 'iPhone 6', 'iPhone 6s', 'iPhone 7', 'iPhone 8'
      ];
      return touchIDModels.some(model => deviceModel.includes(model));
    }

    return false;
  }

  private iPadHasFaceID(deviceModel?: string): boolean {
    if (!deviceModel) return false;
    
    // iPad Pro models with Face ID
    const faceIDiPads = [
      'iPad Pro (11-inch)', 'iPad Pro (12.9-inch)', 'iPad Air'
    ];
    
    return faceIDiPads.some(model => deviceModel.includes(model));
  }

  private iPadHasTouchID(deviceModel?: string): boolean {
    if (!deviceModel) return false;
    
    // Most iPads have Touch ID unless they have Face ID
    return deviceModel.includes('iPad') && !this.iPadHasFaceID(deviceModel);
  }

  // Android device capability detection
  private androidDeviceHasFaceUnlock(deviceModel?: string, ua?: string): boolean {
    if (!deviceModel) return false;

    const faceUnlockDevices = [
      'Pixel', 'Galaxy S', 'Galaxy Note', 'OnePlus', 'Mi ', 'Xiaomi'
    ];

    return faceUnlockDevices.some(device => deviceModel.includes(device));
  }

  private getAndroidFaceUnlockName(deviceModel?: string): string {
    if (!deviceModel) return 'Face Unlock';
    
    if (deviceModel.includes('Pixel')) return 'Face Unlock';
    if (deviceModel.includes('Galaxy')) return 'Face Recognition';
    if (deviceModel.includes('OnePlus')) return 'Face Unlock';
    if (deviceModel.includes('Mi') || deviceModel.includes('Xiaomi')) return 'Face Unlock';
    
    return 'Face Unlock';
  }

  private androidFaceUnlockIsHardwareBacked(deviceModel?: string): boolean {
    if (!deviceModel) return false;
    
    // Pixel 4 and newer, Galaxy S10 and newer typically have hardware-backed face unlock
    const hardwareBackedDevices = ['Pixel 4', 'Pixel 5', 'Pixel 6', 'Galaxy S1', 'Galaxy S2'];
    
    return hardwareBackedDevices.some(device => deviceModel.includes(device));
  }

  private androidFaceUnlockSecurityLevel(deviceModel?: string): 'convenience' | 'weak' | 'strong' {
    if (this.androidFaceUnlockIsHardwareBacked(deviceModel)) {
      return 'strong';
    }
    return 'weak';
  }

  private androidDeviceHasIris(deviceModel?: string): boolean {
    if (!deviceModel) return false;
    
    // Mainly Samsung Galaxy Note and S series
    const irisDevices = ['Galaxy Note', 'Galaxy S8', 'Galaxy S9'];
    
    return irisDevices.some(device => deviceModel.includes(device));
  }

  // Get primary biometric method for device
  private getiOSPrimaryMethod(deviceModel?: string): string | undefined {
    if (this.iOSDeviceHasFaceID(deviceModel)) return 'face-id';
    if (this.iOSDeviceHasTouchID(deviceModel)) return 'touch-id';
    return undefined;
  }

  private getAndroidPrimaryMethod(deviceModel?: string): string | undefined {
    if (this.androidDeviceHasFaceUnlock(deviceModel)) return 'face-unlock';
    return 'fingerprint';
  }

  // Get fallback methods for platform
  private getFallbackMethods(platform: string): string[] {
    switch (platform) {
      case 'iOS':
        return ['device-passcode'];
      case 'Android':
        return ['pin', 'pattern', 'password'];
      case 'macOS':
        return ['system-password'];
      case 'Windows':
        return ['windows-password', 'pin'];
      default:
        return [];
    }
  }

  // WebAuthn support detection
  private async checkWebAuthnSupport(): Promise<DeviceBiometricInfo['webauthn']> {
    const supported = 'credentials' in navigator && 'create' in navigator.credentials;
    
    let platformAuthenticator = false;
    let userVerifyingPlatformAuthenticator = false;
    let autofillSupported = false;

    if (supported) {
      try {
        platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        userVerifyingPlatformAuthenticator = platformAuthenticator;
        
        // Check autofill support if available
        if ('isConditionalMediationAvailable' in PublicKeyCredential) {
          autofillSupported = await (PublicKeyCredential as any).isConditionalMediationAvailable();
        }
      } catch (error) {
        console.warn('WebAuthn feature detection failed:', error);
      }
    }

    return {
      supported,
      platformAuthenticator,
      userVerifyingPlatformAuthenticator,
      autofillSupported,
    };
  }

  private async checkPlatformAuthenticator(): Promise<boolean> {
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  // Utility method to get user-friendly biometric name
  getBiometricDisplayName(type: string, deviceModel?: string, platform?: string): string {
    switch (type) {
      case 'face-id':
        return 'Face ID';
      case 'touch-id':
        return 'Touch ID';
      case 'fingerprint':
        return 'Fingerprint Scanner';
      case 'face-unlock':
        return this.getAndroidFaceUnlockName(deviceModel);
      case 'iris':
        return 'Iris Scanner';
      case 'windows-hello-face':
        return 'Windows Hello Face';
      case 'windows-hello-fingerprint':
        return 'Windows Hello Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  }

  // Get appropriate icon for biometric type
  getBiometricIcon(type: string): string {
    switch (type) {
      case 'face-id':
        return '🆔';
      case 'touch-id':
        return '👆';
      case 'fingerprint':
        return '👆';
      case 'face-unlock':
        return '😊';
      case 'iris':
        return '👁️';
      case 'windows-hello-face':
        return '😊';
      case 'windows-hello-fingerprint':
        return '👆';
      default:
        return '🔐';
    }
  }
}

export const deviceBiometricService = DeviceBiometricService.getInstance();
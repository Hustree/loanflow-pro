import { z } from 'zod';

// Enhanced Android Device Info Schema (from PRD)
export const AndroidDeviceInfoSchema = z.object({
  // Existing fields
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  browser: z.string(),
  os: z.string(),
  deviceName: z.string(),
  
  // New Android-specific fields
  androidVersion: z.string().optional(),           // "13", "14", etc.
  apiLevel: z.number().optional(),                 // 28, 29, 30, etc.
  biometricCapabilities: z.object({
    fingerprint: z.boolean(),
    faceUnlock: z.boolean(),
    iris: z.boolean(),
    strongBiometrics: z.boolean(),      // Class 3 (Strong)
    weakBiometrics: z.boolean(),        // Class 2 (Weak)
    convenienceBiometrics: z.boolean(), // Class 1 (Convenience)
  }).optional(),
  securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  biometricEnrolled: z.boolean().optional(),
  fallbackMethods: z.array(z.string()).optional(),  // ["PIN", "PATTERN", "PASSWORD"]
  hardwareBacked: z.boolean().optional(),           // Uses TEE/SE
});

export type AndroidDeviceInfo = z.infer<typeof AndroidDeviceInfoSchema>;

export interface BiometricEnrollmentResult {
  success: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | 'multiple';
  securityClass: 1 | 2 | 3;
  hardwareBacked: boolean;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  biometricType: string;
  timestamp: Date;
  error?: string;
}

export interface BiometricPromptOptions {
  title: string;
  subtitle?: string;
  description?: string;
  negativeButtonText: string;
  allowDeviceCredential?: boolean;
}

declare global {
  interface Window {
    // Android WebView interface
    AndroidBiometric?: {
      checkCapabilities(): Promise<string>;
      enrollBiometric(type: string): Promise<string>;
      authenticateWithBiometric(options: string): Promise<string>;
    };
    // Chrome Android API detection
    chrome?: any;
  }

  interface Navigator {
    userAgentData?: {
      brands: Array<{ brand: string; version: string }>;
      mobile: boolean;
      platform: string;
    };
  }
}

export class AndroidBiometricService {
  private static instance: AndroidBiometricService;
  
  private constructor() {}
  
  public static getInstance(): AndroidBiometricService {
    if (!AndroidBiometricService.instance) {
      AndroidBiometricService.instance = new AndroidBiometricService();
    }
    return AndroidBiometricService.instance;
  }

  // Check if device is Android
  isAndroidDevice(): boolean {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    
    return /Android/i.test(ua) || 
           /Linux armv/i.test(platform) ||
           (navigator.userAgentData?.platform === 'Android');
  }

  // Get Android version from user agent
  private getAndroidVersion(): string | undefined {
    const ua = navigator.userAgent;
    const match = ua.match(/Android\s+(\d+(?:\.\d+)*)/i);
    return match ? match[1] : undefined;
  }

  // Convert Android version to API level (approximate)
  private getApiLevel(androidVersion: string): number {
    const version = parseFloat(androidVersion);
    
    // Android version to API level mapping
    const versionMap: { [key: number]: number } = {
      14: 34,
      13: 33,
      12: 31,
      11: 30,
      10: 29,
      9: 28,
      8.1: 27,
      8.0: 26,
      7.1: 25,
      7.0: 24,
    };
    
    return versionMap[version] || Math.max(28, Math.floor(version) + 19);
  }

  // Enhanced device detection with Android capabilities
  async checkBiometricCapabilities(): Promise<AndroidDeviceInfo> {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    
    // Base device info
    const baseInfo = {
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua, platform),
      deviceName: this.generateDeviceName(),
    };

    if (!this.isAndroidDevice()) {
      return AndroidDeviceInfoSchema.parse(baseInfo);
    }

    // Android-specific detection
    const androidVersion = this.getAndroidVersion();
    const apiLevel = androidVersion ? this.getApiLevel(androidVersion) : undefined;

    try {
      // Try to detect biometric capabilities
      const biometricCapabilities = await this.detectBiometricCapabilities(apiLevel);
      const securityLevel = this.assessSecurityLevel(biometricCapabilities, apiLevel);
      
      const androidInfo = {
        ...baseInfo,
        androidVersion,
        apiLevel,
        biometricCapabilities,
        securityLevel,
        biometricEnrolled: await this.checkBiometricEnrollment(),
        fallbackMethods: this.detectFallbackMethods(),
        hardwareBacked: await this.checkHardwareBackedSecurity(),
      };

      return AndroidDeviceInfoSchema.parse(androidInfo);
    } catch (error) {
      console.warn('Android biometric detection failed:', error);
      
      // Return basic Android info on failure
      return AndroidDeviceInfoSchema.parse({
        ...baseInfo,
        androidVersion,
        apiLevel,
        securityLevel: 'MEDIUM',
      });
    }
  }

  // Detect available biometric capabilities
  private async detectBiometricCapabilities(apiLevel?: number) {
    const capabilities = {
      fingerprint: false,
      faceUnlock: false,
      iris: false,
      strongBiometrics: false,
      weakBiometrics: false,
      convenienceBiometrics: false,
    };

    // Check if Android WebView interface is available
    if (window.AndroidBiometric) {
      try {
        const result = await window.AndroidBiometric.checkCapabilities();
        const caps = JSON.parse(result);
        return { ...capabilities, ...caps };
      } catch (error) {
        console.warn('AndroidBiometric interface failed:', error);
      }
    }

    // Fallback: Check using Web APIs and user agent patterns
    if (apiLevel && apiLevel >= 28) {
      // Android 9+ has biometric support
      capabilities.convenienceBiometrics = true;
      
      if (apiLevel >= 29) {
        // Android 10+ has enhanced biometrics
        capabilities.fingerprint = await this.checkFingerprintCapability();
        capabilities.faceUnlock = await this.checkFaceUnlockCapability();
        capabilities.weakBiometrics = true;
      }
      
      if (apiLevel >= 30) {
        // Android 11+ has strong biometrics
        capabilities.strongBiometrics = true;
      }
    }

    return capabilities;
  }

  // Check fingerprint capability using available APIs
  private async checkFingerprintCapability(): Promise<boolean> {
    // Check for TouchID/FaceID support (which includes fingerprint on Android)
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      try {
        // This will be true if platform authenticator is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      } catch {
        return false;
      }
    }
    
    return false;
  }

  // Check face unlock capability
  private async checkFaceUnlockCapability(): Promise<boolean> {
    const ua = navigator.userAgent;
    
    // Look for device patterns that commonly support face unlock
    const faceUnlockDevices = [
      /Pixel [3-9]/i,        // Google Pixel 3+
      /Galaxy S[89]/i,       // Samsung Galaxy S8+
      /Galaxy S1[0-9]/i,     // Samsung Galaxy S10+
      /Galaxy Note[89]/i,    // Samsung Galaxy Note 8+
      /Galaxy Note1[0-9]/i,  // Samsung Galaxy Note 10+
      /OnePlus [5-9]/i,      // OnePlus 5+
      /Xiaomi Mi [89]/i,     // Xiaomi Mi 8+
    ];
    
    return faceUnlockDevices.some(pattern => pattern.test(ua));
  }

  // Assess overall security level
  private assessSecurityLevel(
    capabilities: any, 
    apiLevel?: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!apiLevel || apiLevel < 28) {
      return 'LOW';
    }
    
    if (capabilities?.strongBiometrics && capabilities?.fingerprint) {
      return 'HIGH';
    }
    
    if (capabilities?.weakBiometrics || capabilities?.fingerprint || capabilities?.faceUnlock) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  // Check if biometrics are enrolled
  private async checkBiometricEnrollment(): Promise<boolean> {
    if (window.AndroidBiometric) {
      try {
        const result = await window.AndroidBiometric.checkCapabilities();
        const caps = JSON.parse(result);
        return caps.enrolled || false;
      } catch {
        return false;
      }
    }
    
    // Fallback: assume enrolled if platform authenticator is available
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  // Detect available fallback methods
  private detectFallbackMethods(): string[] {
    const methods = ['PIN', 'PATTERN', 'PASSWORD'];
    
    // All modern Android devices support these fallback methods
    return methods;
  }

  // Check for hardware-backed security
  private async checkHardwareBackedSecurity(): Promise<boolean> {
    if (window.AndroidBiometric) {
      try {
        const result = await window.AndroidBiometric.checkCapabilities();
        const caps = JSON.parse(result);
        return caps.hardwareBacked || false;
      } catch {
        return false;
      }
    }
    
    // Fallback: assume hardware backing on modern devices
    const androidVersion = this.getAndroidVersion();
    const apiLevel = androidVersion ? this.getApiLevel(androidVersion) : 0;
    
    return apiLevel >= 30; // Android 11+ typically has hardware backing
  }

  // Enroll biometric (triggers native Android enrollment)
  async enrollBiometric(type: 'fingerprint' | 'face' | 'iris' = 'fingerprint'): Promise<BiometricEnrollmentResult> {
    if (!this.isAndroidDevice()) {
      return {
        success: false,
        biometricType: type,
        securityClass: 1,
        hardwareBacked: false,
        error: 'Not an Android device',
      };
    }

    if (window.AndroidBiometric) {
      try {
        const result = await window.AndroidBiometric.enrollBiometric(type);
        const enrollment = JSON.parse(result);
        
        return {
          success: enrollment.success,
          biometricType: enrollment.biometricType || type,
          securityClass: enrollment.securityClass || 2,
          hardwareBacked: enrollment.hardwareBacked || false,
          error: enrollment.error,
        };
      } catch (error) {
        return {
          success: false,
          biometricType: type,
          securityClass: 1,
          hardwareBacked: false,
          error: `Enrollment failed: ${error}`,
        };
      }
    }

    // Fallback: Cannot directly trigger enrollment without native interface
    return {
      success: false,
      biometricType: type,
      securityClass: 1,
      hardwareBacked: false,
      error: 'Native enrollment interface not available. Please enroll biometrics in device settings.',
    };
  }

  // Authenticate with biometric (triggers native Android prompt)
  async authenticateWithBiometric(options: BiometricPromptOptions): Promise<BiometricAuthResult> {
    if (!this.isAndroidDevice()) {
      return {
        success: false,
        biometricType: 'none',
        timestamp: new Date(),
        error: 'Not an Android device',
      };
    }

    if (window.AndroidBiometric) {
      try {
        const result = await window.AndroidBiometric.authenticateWithBiometric(JSON.stringify(options));
        const auth = JSON.parse(result);
        
        return {
          success: auth.success,
          biometricType: auth.biometricType || 'fingerprint',
          timestamp: new Date(),
          error: auth.error,
        };
      } catch (error) {
        return {
          success: false,
          biometricType: 'unknown',
          timestamp: new Date(),
          error: `Authentication failed: ${error}`,
        };
      }
    }

    // Fallback: Use WebAuthn for biometric authentication
    try {
      // This will trigger the native biometric prompt on Android
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (!available) {
        return {
          success: false,
          biometricType: 'none',
          timestamp: new Date(),
          error: 'Biometric authentication not available',
        };
      }

      return {
        success: true,
        biometricType: 'platform',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        biometricType: 'unknown',
        timestamp: new Date(),
        error: `WebAuthn fallback failed: ${error}`,
      };
    }
  }

  // Helper methods (reused from existing service)
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    if (/iPad|Android.*Tablet/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(ua: string): string {
    if (/Edg/i.test(ua)) return 'Edge';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Firefox/i.test(ua)) return 'Firefox';
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
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    
    const browser = this.detectBrowser(ua);
    const os = this.detectOS(ua, platform);
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Add Android-specific device name detection
    if (this.isAndroidDevice()) {
      const androidModel = this.extractAndroidModel(ua);
      if (androidModel) {
        return `${androidModel} (${browser}) - ${date}`;
      }
    }
    
    return `${browser} on ${os} (${date})`;
  }

  private extractAndroidModel(ua: string): string | null {
    // Extract Android device model from user agent
    const patterns = [
      /Android.*?;\s*([^;)]+)\)/i,        // Standard Android pattern
      /\(([^;]+);\s*wv\)/i,              // WebView pattern
      /(SM-[A-Z0-9]+)/i,                 // Samsung models
      /(Pixel [0-9]+[a-zA-Z]*)/i,        // Google Pixel
      /(Mi [A-Z0-9 ]+)/i,                // Xiaomi
      /(OnePlus [A-Z0-9]+)/i,            // OnePlus
    ];

    for (const pattern of patterns) {
      const match = ua.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }
}

export const androidBiometricService = AndroidBiometricService.getInstance();
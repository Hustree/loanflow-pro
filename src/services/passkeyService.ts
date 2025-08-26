import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
} from '@simplewebauthn/browser';
import { z } from 'zod';
import { androidBiometricService, AndroidDeviceInfo } from './androidBiometricService';
import { deviceBiometricService, DeviceBiometricInfo } from './deviceBiometricService';

// Enhanced Zod Schemas for Android Biometric Support
export const AndroidPasskeyCredentialSchema = z.object({
  // Existing fields
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
  
  // New Android-specific fields
  biometricType: z.enum(['fingerprint', 'face', 'iris', 'multiple']).optional(),
  securityClass: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  hardwareBacked: z.boolean().optional(),
  fallbackMethod: z.string().optional(),
  lastBiometricUsed: z.date().optional(),
  biometricFailureCount: z.number().optional(),
});

// Keep original schema for backward compatibility
export const PasskeyCredentialSchema = AndroidPasskeyCredentialSchema;

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
    residentKey: z.string().optional(),
    userVerification: z.string().optional(),
  }).optional(),
  excludeCredentials: z.array(z.object({
    id: z.string(),
    type: z.literal('public-key'),
    transports: z.array(z.string()).optional(),
  })).optional(),
});

export type PasskeyCredential = z.infer<typeof PasskeyCredentialSchema>;
export type RegistrationOptions = z.infer<typeof RegistrationOptionsSchema>;

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  deviceName: string;
}

export interface EnhancedDeviceInfo extends DeviceInfo {
  androidInfo?: AndroidDeviceInfo;
  supportsBiometrics?: boolean;
  biometricTypes?: string[];
  // New comprehensive biometric info
  biometricInfo?: DeviceBiometricInfo;
}

// Mock API endpoints for development
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const USE_MOCK_API = !API_BASE_URL || process.env.REACT_APP_USE_MOCK_PASSKEY === 'true';

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

  // Check autofill support
  async checkAutofillSupport(): Promise<boolean> {
    try {
      return await browserSupportsWebAuthnAutofill();
    } catch {
      return false;
    }
  }

  // Detect device information (enhanced for Android)
  getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    
    return {
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua, platform),
      deviceName: this.generateDeviceName(),
    };
  }

  // Get enhanced device info with comprehensive biometric capabilities
  async getEnhancedDeviceInfo(): Promise<EnhancedDeviceInfo> {
    const baseInfo = this.getDeviceInfo();
    
    try {
      // Get comprehensive biometric info from new service
      const biometricInfo = await deviceBiometricService.getDeviceBiometricInfo();
      const supportsBiometrics = biometricInfo.biometrics.available;
      
      const biometricTypes: string[] = biometricInfo.biometrics.methods
        .filter(method => method.supported)
        .map(method => method.type);

      // Legacy Android support
      let androidInfo: AndroidDeviceInfo | undefined;
      if (androidBiometricService.isAndroidDevice()) {
        try {
          androidInfo = await androidBiometricService.checkBiometricCapabilities();
        } catch (error) {
          console.warn('Failed to get legacy Android biometric info:', error);
        }
      }
      
      return {
        ...baseInfo,
        androidInfo,
        supportsBiometrics,
        biometricTypes,
        biometricInfo,
      };
    } catch (error) {
      console.warn('Failed to get enhanced device info:', error);
      return {
        ...baseInfo,
        supportsBiometrics: false,
        biometricTypes: [],
      };
    }
  }

  // Get user-friendly biometric method name
  getBiometricDisplayName(type: string): string {
    return deviceBiometricService.getBiometricDisplayName(type);
  }

  // Get primary biometric method for current device
  async getPrimaryBiometricMethod(): Promise<{ type: string; name: string; icon: string } | null> {
    try {
      const info = await deviceBiometricService.getDeviceBiometricInfo();
      const primaryType = info.biometrics.primaryMethod;
      
      if (primaryType) {
        const method = info.biometrics.methods.find(m => m.type === primaryType);
        if (method && method.supported) {
          return {
            type: method.type,
            name: method.name,
            icon: method.icon,
          };
        }
      }
      
      // Fallback to first supported method
      const firstSupported = info.biometrics.methods.find(m => m.supported);
      if (firstSupported) {
        return {
          type: firstSupported.type,
          name: firstSupported.name,
          icon: firstSupported.icon,
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get primary biometric method:', error);
      return null;
    }
  }

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
    
    return `${browser} on ${os} (${date})`;
  }

  // Generate mock registration options for development
  private generateMockRegistrationOptions(email: string, displayName: string): RegistrationOptions {
    // Generate WebAuthn-compatible random challenge
    const challenge = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const userId = btoa(email);
    
    return {
      challenge,
      rp: {
        name: 'PSSLAI Loan App',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: email,
        displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256 (preferred for iOS)
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // This ensures Face ID/Touch ID is used
        requireResidentKey: false,
        residentKey: 'preferred',
        userVerification: 'required', // This will trigger Face ID/Touch ID prompt
      },
      excludeCredentials: [],
    };
  }

  // Generate mock authentication options for development
  private generateMockAuthenticationOptions() {
    // Generate WebAuthn-compatible random challenge
    const challenge = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    
    return {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname,
      userVerification: 'required', // This will trigger Face ID/Touch ID prompt
      allowCredentials: [] as any[],
    };
  }

  // Enhanced registration process with Android biometric support
  async startRegistration(email: string, displayName: string, biometricType?: 'fingerprint' | 'face' | 'iris') {
    try {
      let options: RegistrationOptions;
      
      if (USE_MOCK_API) {
        // Use mock options for development
        options = this.generateMockRegistrationOptions(email, displayName);
        console.log('[MOCK] Using mock registration options:', options);
      } else {
        // Get registration options from server
        const response = await fetch(`${API_BASE_URL}/api/auth/passkey/register/begin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, displayName }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get registration options');
        }
        
        options = await response.json();
      }
      
      // Validate server response
      const validatedOptions = RegistrationOptionsSchema.parse(options);
      
      // Check for Android biometric enrollment if requested
      let biometricInfo = null;
      if (androidBiometricService.isAndroidDevice() && biometricType) {
        try {
          const enrollmentResult = await androidBiometricService.enrollBiometric(biometricType);
          if (!enrollmentResult.success) {
            console.warn('Biometric enrollment failed:', enrollmentResult.error);
          } else {
            biometricInfo = enrollmentResult;
          }
        } catch (error) {
          console.warn('Biometric enrollment error:', error);
        }
      }

      // Start WebAuthn registration with Android biometric prompt if available
      const credential = await startRegistration({ optionsJSON: validatedOptions as any });
      
      // Add enhanced device info with Android capabilities
      const deviceInfo = await this.getEnhancedDeviceInfo();
      
      if (USE_MOCK_API) {
        // Mock successful registration
        console.log('[MOCK] Registration successful:', { credential, deviceInfo });
        
        // Store mock passkey with Android biometric info
        const mockPasskeys = JSON.parse(localStorage.getItem('mockPasskeys') || '[]');
        const passkeyData = {
          id: credential.id,
          email,
          displayName,
          deviceInfo,
          createdAt: new Date().toISOString(),
          // Android biometric fields
          ...(biometricInfo && {
            biometricType: biometricInfo.biometricType,
            securityClass: biometricInfo.securityClass,
            hardwareBacked: biometricInfo.hardwareBacked,
            lastBiometricUsed: new Date().toISOString(),
            biometricFailureCount: 0,
          }),
        };
        mockPasskeys.push(passkeyData);
        localStorage.setItem('mockPasskeys', JSON.stringify(mockPasskeys));
        
        return {
          success: true,
          token: 'mock-passkey-token-' + Date.now(),
          device: {
            id: credential.id,
            name: deviceInfo.deviceName,
            type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
        };
      }
      
      // Verify with server
      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credential,
          deviceInfo,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }
      
      return await verifyResponse.json();
    } catch (error: any) {
      console.error('Passkey registration failed:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Registration was cancelled or timed out. Please try again.');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('This device may already be registered. Try signing in instead.');
      }
      if (error.name === 'NotSupportedError') {
        throw new Error('Your device does not support passkey authentication.');
      }
      
      throw error;
    }
  }

  // Enhanced authentication process with Android biometric support
  async startAuthentication(email: string, useAndroidBiometric: boolean = true) {
    try {
      
      let options;
      
      if (USE_MOCK_API) {
        // Use mock options for development
        options = this.generateMockAuthenticationOptions();
        console.log('[MOCK] Using mock authentication options:', options);
        
        // Check if user has mock passkeys
        const mockPasskeys = JSON.parse(localStorage.getItem('mockPasskeys') || '[]');
        const userPasskeys = mockPasskeys.filter((p: any) => p.email === email);
        
        if (userPasskeys.length > 0) {
          options.allowCredentials = userPasskeys.map((p: any) => ({
            id: p.id,
            type: 'public-key',
            transports: ['internal', 'hybrid'],
          }));
        }
      } else {
        // Get authentication options from server
        const response = await fetch(`${API_BASE_URL}/api/auth/passkey/login/begin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No passkeys found for this account. Please register a passkey first.');
          }
          throw new Error('Failed to get authentication options');
        }
        
        options = await response.json();
      }
      
      // Try Android biometric authentication first if requested
      if (useAndroidBiometric && androidBiometricService.isAndroidDevice()) {
        try {
          const biometricAuth = await androidBiometricService.authenticateWithBiometric({
            title: 'Authenticate with Biometric',
            subtitle: 'Use your biometric to sign in',
            description: 'Authenticate to access your PSSLAI loan account',
            negativeButtonText: 'Use Password',
            allowDeviceCredential: true,
          });

          if (biometricAuth.success) {
            console.log('[Android Biometric] Pre-authentication successful');
          } else {
            console.warn('[Android Biometric] Pre-authentication failed:', biometricAuth.error);
          }
        } catch (error) {
          console.warn('[Android Biometric] Error during pre-authentication:', error);
        }
      }

      // Start WebAuthn authentication (this will trigger the system biometric prompt)
      const credential = await startAuthentication({ optionsJSON: options as any });
      
      if (USE_MOCK_API) {
        // Mock successful authentication
        console.log('[MOCK] Authentication successful:', credential);
        
        // Update last used time and biometric usage in mock storage
        const mockPasskeys = JSON.parse(localStorage.getItem('mockPasskeys') || '[]');
        const passkeyIndex = mockPasskeys.findIndex((p: any) => p.id === credential.id);
        if (passkeyIndex !== -1) {
          mockPasskeys[passkeyIndex].lastUsed = new Date().toISOString();
          if (useAndroidBiometric && mockPasskeys[passkeyIndex].biometricType) {
            mockPasskeys[passkeyIndex].lastBiometricUsed = new Date().toISOString();
            mockPasskeys[passkeyIndex].biometricFailureCount = 0; // Reset on success
          }
          localStorage.setItem('mockPasskeys', JSON.stringify(mockPasskeys));
        }
        
        // Store mock auth session
        sessionStorage.setItem('passkeyAuth', JSON.stringify({
          email,
          authenticatedAt: new Date().toISOString(),
          credentialId: credential.id,
        }));
        
        return {
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
        };
      }
      
      // Verify with server
      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          credential,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Authentication verification failed');
      }
      
      return await verifyResponse.json();
    } catch (error: any) {
      console.error('Passkey authentication failed:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Authentication was cancelled or timed out. Please try again.');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('Authentication failed. Please try again.');
      }
      if (error.name === 'NotSupportedError') {
        throw new Error('Your device does not support passkey authentication.');
      }
      
      throw error;
    }
  }

  // Get user's passkeys (mock implementation for development)
  async getUserPasskeys(email: string): Promise<any[]> {
    if (USE_MOCK_API) {
      const mockPasskeys = JSON.parse(localStorage.getItem('mockPasskeys') || '[]');
      return mockPasskeys.filter((p: any) => p.email === email);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/passkey/list?email=${encodeURIComponent(email)}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  }

  // Remove a passkey (mock implementation for development)
  async removePasskey(passkeyId: string): Promise<boolean> {
    if (USE_MOCK_API) {
      const mockPasskeys = JSON.parse(localStorage.getItem('mockPasskeys') || '[]');
      const filtered = mockPasskeys.filter((p: any) => p.id !== passkeyId);
      localStorage.setItem('mockPasskeys', JSON.stringify(filtered));
      return true;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/passkey/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ passkeyId }),
    });
    
    return response.ok;
  }

  // Check if user has passkeys
  async hasPasskeys(email: string): Promise<boolean> {
    const passkeys = await this.getUserPasskeys(email);
    return passkeys.length > 0;
  }

  // Check if user has Android biometric passkeys
  async hasAndroidBiometricPasskeys(email: string): Promise<boolean> {
    if (!androidBiometricService.isAndroidDevice()) {
      return false;
    }

    const passkeys = await this.getUserPasskeys(email);
    return passkeys.some((p: any) => p.biometricType);
  }

  // Get Android device capabilities
  async getAndroidCapabilities(): Promise<AndroidDeviceInfo | null> {
    if (!androidBiometricService.isAndroidDevice()) {
      return null;
    }

    try {
      return await androidBiometricService.checkBiometricCapabilities();
    } catch (error) {
      console.error('Failed to get Android capabilities:', error);
      return null;
    }
  }

  // Create Android passkey with specific biometric type
  async createAndroidPasskey(
    email: string, 
    displayName: string,
    biometricType: 'fingerprint' | 'face' | 'iris' | 'multiple' = 'fingerprint'
  ): Promise<any> {
    if (!androidBiometricService.isAndroidDevice()) {
      throw new Error('Not an Android device');
    }

    // Check if biometric type is supported
    const capabilities = await this.getAndroidCapabilities();
    if (!capabilities?.biometricCapabilities) {
      throw new Error('Biometric capabilities not available');
    }

    const { biometricCapabilities } = capabilities;
    if (biometricType === 'fingerprint' && !biometricCapabilities.fingerprint) {
      throw new Error('Fingerprint not supported on this device');
    }
    if (biometricType === 'face' && !biometricCapabilities.faceUnlock) {
      throw new Error('Face unlock not supported on this device');
    }
    if (biometricType === 'iris' && !biometricCapabilities.iris) {
      throw new Error('Iris scanning not supported on this device');
    }

    // Convert 'multiple' to a specific type for registration
    const registrationBiometricType = biometricType === 'multiple' ? 'fingerprint' : biometricType;
    
    return await this.startRegistration(email, displayName, registrationBiometricType);
  }

  // Authenticate with specific Android biometric method
  async authenticateWithAndroidBiometric(
    email: string,
    credentialId?: string
  ): Promise<any> {
    if (!androidBiometricService.isAndroidDevice()) {
      throw new Error('Not an Android device');
    }

    return await this.startAuthentication(email, true);
  }

  // Get biometric security level for user
  async getBiometricSecurityLevel(email: string): Promise<'LOW' | 'MEDIUM' | 'HIGH' | null> {
    if (!androidBiometricService.isAndroidDevice()) {
      return null;
    }

    const capabilities = await this.getAndroidCapabilities();
    return capabilities?.securityLevel || null;
  }
}

export const passkeyService = PasskeyService.getInstance();
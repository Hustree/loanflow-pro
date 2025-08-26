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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
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
    
    const unsubscribe = firebaseService.onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Store auth state in session for fallback
      if (authUser) {
        sessionStorage.setItem('authUser', JSON.stringify({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
        }));
      } else {
        sessionStorage.removeItem('authUser');
      }
    });

    // Check session storage for existing auth
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // This is a simplified version, in production you'd verify with Firebase
        setUser(parsedUser as User);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if user has passkeys when user changes
    if (user?.email) {
      checkUserPasskeys(user.email);
    } else {
      setHasPasskey(false);
    }
  }, [user]);

  const checkUserPasskeys = async (email: string) => {
    try {
      const hasKeys = await passkeyService.hasPasskeys(email);
      setHasPasskey(hasKeys);
    } catch (err) {
      console.error('Failed to check passkeys:', err);
      setHasPasskey(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Demo mode fallback
      if (email === 'demo@psslai.com' && password === 'demo1234') {
        const demoUser = {
          uid: 'demo-user-001',
          email: 'demo@psslai.com',
          displayName: 'Demo User',
        } as unknown as User;
        
        setUser(demoUser);
        sessionStorage.setItem('authUser', JSON.stringify(demoUser));
        return;
      }
      
      // Legacy login support
      if (email === 'psslaimember' && password === '1234') {
        const legacyUser = {
          uid: 'legacy-user-001',
          email: 'psslaimember@psslai.com',
          displayName: 'PSSLAI Member',
        } as unknown as User;
        
        setUser(legacyUser);
        sessionStorage.setItem('authUser', JSON.stringify(legacyUser));
        return;
      }
      
      // Firebase authentication
      const authUser = await firebaseService.signIn(email, password);
      setUser(authUser);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await firebaseService.signUp(email, password, displayName);
      setUser(authUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if using demo/legacy mode
      const storedUser = sessionStorage.getItem('authUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.uid === 'demo-user-001' || parsedUser.uid === 'legacy-user-001') {
          setUser(null);
          sessionStorage.removeItem('authUser');
          sessionStorage.removeItem('isAuthenticated');
          return;
        }
      }
      
      // Firebase logout
      await firebaseService.signOutUser();
      setUser(null);
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('isAuthenticated');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPasskey = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await passkeyService.startAuthentication(email);
      
      if (result.success) {
        // Create a mock user for passkey auth
        const passkeyUser = {
          uid: `passkey-${email}`,
          email: email,
          displayName: email.split('@')[0],
        } as unknown as User;
        
        setUser(passkeyUser);
        sessionStorage.setItem('authUser', JSON.stringify(passkeyUser));
        
        if (result.token) {
          sessionStorage.setItem('authToken', result.token);
        }
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

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    loginWithPasskey,
    register,
    registerPasskey,
    logout,
    clearError,
    hasPasskey,
    passkeySupported,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
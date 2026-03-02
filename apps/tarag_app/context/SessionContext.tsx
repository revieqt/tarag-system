import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState, useRef } from 'react';
import { BACKEND_URL } from '@/constants/Config';
import { 
  loginUser, 
  registerUser, 
  sendEmailVerificationCode, 
  verifyEmail, 
  resetPassword,
  updatePassword
} from '@/services/authService';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';

// ============================================================================
// 🔐 AUTH HOOKS - Following architecture: screen > hook > service > backend
// ============================================================================

/**
 * Hook for user login
 * Handles device info, session update, and token management
 */
export const useAuthLogin = () => {
  const deviceInfo = useDeviceInfo();
  const { updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      const result = await loginUser(identifier, password, deviceInfo);
      
      // Transform user data for storage
      const userData = {
        id: result.user._id,
        fname: result.user.fname,
        lname: result.user.lname,
        username: result.user.username,
        email: result.user.email,
        bdate: new Date(result.user.bdate),
        gender: result.user.gender,
        contactNumber: result.user.contactNumber,
        profileImage: result.user.profileImage,
        likes: result.user.likes || [],
        isProUser: result.user.isProUser,
        bio: result.user.bio || '',
        status: result.user.status,
        type: result.user.type,
        expPoints: result.user.expPoints,
        createdOn: new Date(result.user.createdOn),
        isFirstLogin: result.user.isFirstLogin,
        safetyState: result.user.safetyState,
        visibilitySettings: result.user.visibilitySettings,
        securitySettings: result.user.securitySettings,
        taraBuddySettings: result.user.taraBuddySettings,
      };

      await updateSession({
        user: userData,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

/**
 * Hook for user registration
 * Handles device info and sends registration request
 */
export const useAuthRegister = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: {
    fname: string;
    lname?: string;
    bdate: string;
    gender: string;
    contactNumber?: string;
    username: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      const result = await registerUser(userData, deviceInfo);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

/**
 * Hook for sending email verification code
 * Handles device info and verification code request
 */
export const useEmailVerification = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      const response = await sendEmailVerificationCode(email, deviceInfo);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send verification code';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendCode, loading, error };
};

/**
 * Hook for verifying email with code
 * Handles device info and email verification
 */
export const useEmailCodeVerification = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (email: string, code: string, sentCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      const result = await verifyEmail(email, code, sentCode, deviceInfo);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Email verification failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading, error };
};

/**
 * Hook for resetting password
 * Handles device info and password reset
 */
export const usePasswordReset = () => {
  const deviceInfo = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = async (identifier: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      const result = await resetPassword(identifier, newPassword, deviceInfo);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Password reset failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reset, loading, error };
};

/**
 * Hook for updating password for authenticated users
 * Handles device info and password update
 */
export const usePasswordUpdate = () => {
  const deviceInfo = useDeviceInfo();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!deviceInfo.isLoaded) {
        throw new Error('Device info not yet loaded');
      }

      if (!session?.user?.id || !session?.accessToken) {
        throw new Error('User not authenticated');
      }

      const result = await updatePassword({
        userId: session.user.id,
        oldPassword,
        newPassword,
        confirmPassword,
        accessToken: session.accessToken,
        device: deviceInfo,
      });
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Password update failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

// ============================================================================
// 🧑‍💻 User type
export type User = {
  id: string;
  fname: string;
  lname?: string;
  username: string;
  email: string;
  bdate: Date;
  gender: string;
  contactNumber?: string;
  profileImage?: string;
  isProUser: boolean;
  bio?: string;
  status: string;
  type: string;
  createdOn: Date;
  updatedOn?: Date;
  isFirstLogin: boolean;
  expPoints: number;
  likes: string[];
  safetyState: {
    isInAnEmergency: boolean;
    emergencyType: string;
    emergencyContact?: string;
  };
  visibilitySettings: {
    isProfilePublic: boolean;
    isTravelInfoPublic: boolean;
    isPersonalInfoPublic: boolean;
  };
  securitySettings: {
    is2FAEnabled: boolean;
  };
  taraBuddySettings: {
    isTaraBuddyEnabled: boolean;
    preferredGender?: string;
    preferredDistance?: number;
    preferredAgeRange?: number[];
    preferredZodiac?: string[];
  };
};

// 🧠 SessionData
export type SessionData = {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
};

// 💡 Context shape
type SessionContextType = {
  session: SessionData | null;
  updateSession: (newData: Partial<SessionData>) => Promise<void>;
  clearSession: () => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<boolean>;
};

// 🔧 Helper functions for JWT handling
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 300; // 5 minutes buffer before expiration
  
  return decoded.exp < (currentTime + bufferTime);
};

// Refresh token function
const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// 🔗 Context init
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 🔐 Provider
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('session');
        
        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed.user) {
            // Normalize _id to id
            if (parsed.user._id && !parsed.user.id) {
              parsed.user.id = parsed.user._id;
            }

            // Convert date strings to Date objects
            if (typeof parsed.user.bdate === 'string') {
              parsed.user.bdate = new Date(parsed.user.bdate);
            }
            if (typeof parsed.user.createdOn === 'string') {
              parsed.user.createdOn = new Date(parsed.user.createdOn);
            }
            if (parsed.user.lastKnownLocation?.updatedAt && typeof parsed.user.lastKnownLocation.updatedAt === 'string') {
              parsed.user.lastKnownLocation.updatedAt = new Date(parsed.user.lastKnownLocation.updatedAt);
            }
          }

          setSession(parsed);
          
          // Check if token expired on load and refresh if needed
          if (isTokenExpired(parsed.accessToken)) {
            console.log('🔄 Token expired on app load, attempting refresh...');
            setTimeout(() => handleTokenRefresh(), 0);
          } else {
            // Schedule refresh for later
            scheduleTokenRefresh(parsed.accessToken);
          }
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error('Error loading session:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateSession = async (newData: Partial<SessionData>) => {
    try {
      // Normalize user data - map _id to id if needed
      if (newData.user && (newData.user as any)._id) {
        newData.user = {
          ...newData.user,
          id: (newData.user as any)._id
        };
      }

      // Convert date strings to Date objects
      if (newData.user) {
        if (typeof newData.user.bdate === 'string') {
          newData.user.bdate = new Date(newData.user.bdate);
        }
        if (typeof newData.user.createdOn === 'string') {
          newData.user.createdOn = new Date(newData.user.createdOn);
        }
      }

      // Deep merge function for nested objects
      const deepMerge = (target: any, source: any): any => {
        const result = { ...target };
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
              result[key] = source[key];
            }
          }
        }
        return result;
      };

      const updated = {
        ...session,
        ...newData,
        user: newData.user ? deepMerge(session?.user || {}, newData.user) : session?.user
      };
      setSession(updated);
      await AsyncStorage.setItem('session', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  const clearSession = async () => {
    try {
      // Clear any pending refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      setSession(null);
      await AsyncStorage.removeItem('session');
      
      // Verify session was cleared
      const verification = await AsyncStorage.getItem('session');
      console.log('🧹 Session cleared, sync stopped');
    } catch (err) {
    }
  };

  const handleTokenRefresh = async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      console.log('🔄 Token refresh already in progress, skipping...');
      return false;
    }

    if (!session?.refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    // Check if refresh token itself is expired
    if (isTokenExpired(session.refreshToken)) {
      console.log('❌ Refresh token expired, clearing session');
      await clearSession();
      return false;
    }

    try {
      isRefreshingRef.current = true;
      console.log('🔄 Refreshing access token...');
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
        await refreshAccessToken(session.refreshToken);
      
      const updatedSession = {
        ...session,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      
      setSession(updatedSession);
      await AsyncStorage.setItem('session', JSON.stringify(updatedSession));
      
      console.log('✅ Token refreshed successfully');
      scheduleTokenRefresh(newAccessToken);
      
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Only clear session on actual refresh failure, not on every refresh attempt
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const scheduleTokenRefresh = (accessToken: string) => {
    if (!accessToken) return;
    
    const decoded = decodeJWT(accessToken);
    if (!decoded || !decoded.exp) return;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const refreshTime = expirationTime - 600; // Refresh 10 minutes before expiration
    const timeUntilRefresh = Math.max(0, (refreshTime - currentTime) * 1000);
    
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    const minutesUntilRefresh = Math.floor(timeUntilRefresh / 1000 / 60);
    console.log(`⏰ Scheduling token refresh in ${minutesUntilRefresh} minutes (${Math.floor(timeUntilRefresh / 1000)} seconds)`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Token refresh scheduled time reached, refreshing...');
      handleTokenRefresh();
    }, timeUntilRefresh);
  };


  // // Add useEffect to schedule token refresh when session loads
  // useEffect(() => {
  //   if (session?.accessToken && !loading) {
  //     // Check if token is already expired
  //     if (isTokenExpired(session.accessToken)) {
  //       console.log('🔄 Access token expired on load, refreshing...');
  //       handleTokenRefresh();
  //     } else {
  //       // Schedule refresh for later
  //       scheduleTokenRefresh(session.accessToken);
  //     }
  //   }
  // }, [session?.accessToken, loading]);


  // Auto-logout banned users
  useEffect(() => {
    if (session?.user?.status === 'banned' && !loading) {
      console.log('🚫 User is banned, logging out...');
      clearSession();
    }
  }, [session?.user?.status, loading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SessionContext.Provider value={{ 
      session, 
      updateSession, 
      clearSession, 
      loading, 
      refreshToken: handleTokenRefresh,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

// 🎯 Hook
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

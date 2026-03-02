import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from './SessionContext';
import { useLocation } from '@/hooks/useLocation';
import { BACKEND_URL } from '@/constants/Config';

// Storage keys
const GLOBAL_ALERTS_STORAGE_KEY = 'globalAlerts';
const LOCAL_ALERTS_STORAGE_KEY = 'localAlerts';
const LAST_FETCH_TIME_KEY = 'lastAlertsFetchTime';

// Types
export type GlobalAlert = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  locations?: string[];
  createdAt: string;
  expiresAt?: string;
  data?: any;
};

export type LocalAlert = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  data?: any;
};

// Context Type
type AlertsContextType = {
  globalAlerts: GlobalAlert[];
  localAlerts: LocalAlert[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  fetchGlobalAlerts: () => Promise<void>;
  addLocalAlert: (alert: Omit<LocalAlert, 'id' | 'createdAt'>) => Promise<void>;
  removeLocalAlert: (alertId: string) => Promise<void>;
  clearGlobalAlerts: () => Promise<void>;
  clearLocalAlerts: () => Promise<void>;
};

// Context initialization
const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Provider Component
export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const { latitude, longitude } = useLocation();

  const [globalAlerts, setGlobalAlerts] = useState<GlobalAlert[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load alerts from storage on mount
  useEffect(() => {
    const loadAlertsFromStorage = async () => {
      try {
        const [globalAlertsData, localAlertsData, lastFetchTimeData] = await Promise.all([
          AsyncStorage.getItem(GLOBAL_ALERTS_STORAGE_KEY),
          AsyncStorage.getItem(LOCAL_ALERTS_STORAGE_KEY),
          AsyncStorage.getItem(LAST_FETCH_TIME_KEY),
        ]);

        if (globalAlertsData) {
          const parsed = JSON.parse(globalAlertsData);
          setGlobalAlerts(parsed);
          console.log('[Alerts] Loaded global alerts from storage:', parsed);
        } else {
          console.log('[Alerts] No global alerts found in storage');
        }

        if (localAlertsData) {
          const parsed = JSON.parse(localAlertsData);
          setLocalAlerts(parsed);
          console.log('[Alerts] Loaded local alerts from storage:', parsed);
        } else {
          console.log('[Alerts] No local alerts found in storage');
        }

        if (lastFetchTimeData) {
          const timestamp = parseInt(lastFetchTimeData);
          setLastFetchTime(timestamp);
          console.log('[Alerts] Last fetch time:', new Date(timestamp).toISOString());
        } else {
          console.log('[Alerts] No previous fetch time found');
        }
      } catch (err) {
        console.error('[Alerts] Failed to load alerts from storage:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadAlertsFromStorage();
  }, []);

  // Check if fetch should happen based on scheduled times
  const shouldFetchAlerts = useCallback((): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const scheduledHours = [0, 6, 12, 18]; // 12am, 6am, 12pm, 6pm

    // Check if current hour is a scheduled time
    const isScheduledHour = scheduledHours.includes(currentHour);

    if (!isScheduledHour) return false;

    // Check if we've already fetched in this hour
    if (lastFetchTime) {
      const lastFetchDate = new Date(lastFetchTime);
      const isSameHour =
        lastFetchDate.getDate() === now.getDate() &&
        lastFetchDate.getHours() === currentHour;

      if (isSameHour) {
        console.log(`[Alerts] Already fetched at ${currentHour}:00, skipping fetch`);
        return false;
      }
    }

    return true;
  }, [lastFetchTime]);

  // Fetch global alerts from backend
  const fetchGlobalAlerts = useCallback(async () => {
    if (!session?.user) {
      console.warn('[Alerts] User session not available, cannot fetch alerts');
      return;
    }

    if (loading) {
      console.log('[Alerts] Fetch already in progress, skipping...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare locations array
      const locationsArray = latitude && longitude ? [{ latitude, longitude }] : [];

      const payload = {
        userId: session.user.id,
        locations: locationsArray,
      };

      console.log('[Alerts] ========== FETCH START ==========');
      console.log('[Alerts] Timestamp:', new Date().toISOString());
      console.log('[Alerts] User ID:', session.user.id);
      console.log('[Alerts] Locations:', locationsArray);
      console.log('[Alerts] Payload:', JSON.stringify(payload, null, 2));
      console.log('[Alerts] Backend URL:', BACKEND_URL);

      const response = await fetch(
        `${BACKEND_URL}/api/alerts/get-user-alerts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('[Alerts] Response Status:', response.status);
      console.log('[Alerts] Response StatusText:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Alerts] Error Response Body:', errorText);
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Alerts] ========== RESPONSE DATA ==========');
      console.log('[Alerts] Full Response:', JSON.stringify(data, null, 2));

      // Store alerts
      const alerts = data.alerts || data || [];
      console.log('[Alerts] Parsed Alerts:', JSON.stringify(alerts, null, 2));
      console.log('[Alerts] Total Alerts Count:', Array.isArray(alerts) ? alerts.length : 0);

      setGlobalAlerts(alerts);

      // Save to AsyncStorage
      await AsyncStorage.setItem(GLOBAL_ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      console.log('[Alerts] Saved to AsyncStorage');

      // Update last fetch time
      const now = Date.now();
      setLastFetchTime(now);
      await AsyncStorage.setItem(LAST_FETCH_TIME_KEY, now.toString());
      console.log('[Alerts] Updated last fetch time:', new Date(now).toISOString());

      console.log('[Alerts] ========== FETCH SUCCESS ==========');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[Alerts] ========== FETCH ERROR ==========');
      console.error('[Alerts] Error Type:', err instanceof Error ? err.constructor.name : 'Unknown');
      console.error('[Alerts] Error Message:', errorMessage);
      console.error('[Alerts] Full Error:', err);
      console.error('[Alerts] =====================================');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session, latitude, longitude, loading]);

  // Add local alert
  const addLocalAlert = useCallback(
    async (alert: Omit<LocalAlert, 'id' | 'createdAt'>) => {
      try {
        const newAlert: LocalAlert = {
          ...alert,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        const updatedAlerts = [...localAlerts, newAlert];
        setLocalAlerts(updatedAlerts);

        await AsyncStorage.setItem(LOCAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        console.log('[Alerts] Added local alert:', newAlert);
      } catch (err) {
        console.error('[Alerts] Error adding local alert:', err);
      }
    },
    [localAlerts]
  );

  // Remove local alert
  const removeLocalAlert = useCallback(
    async (alertId: string) => {
      try {
        const updatedAlerts = localAlerts.filter(alert => alert.id !== alertId);
        setLocalAlerts(updatedAlerts);

        await AsyncStorage.setItem(LOCAL_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        console.log('[Alerts] Removed local alert:', alertId);
      } catch (err) {
        console.error('[Alerts] Error removing local alert:', err);
      }
    },
    [localAlerts]
  );

  // Clear all global alerts
  const clearGlobalAlerts = useCallback(async () => {
    try {
      setGlobalAlerts([]);
      await AsyncStorage.removeItem(GLOBAL_ALERTS_STORAGE_KEY);
      console.log('[Alerts] Cleared global alerts');
    } catch (err) {
      console.error('[Alerts] Error clearing global alerts:', err);
    }
  }, []);

  // Clear all local alerts
  const clearLocalAlerts = useCallback(async () => {
    try {
      setLocalAlerts([]);
      await AsyncStorage.removeItem(LOCAL_ALERTS_STORAGE_KEY);
      console.log('[Alerts] Cleared local alerts');
    } catch (err) {
      console.error('[Alerts] Error clearing local alerts:', err);
    }
  }, []);

  // Auto-fetch on app open if needed
  useEffect(() => {
    if (!isInitialized || !session?.user) return;

    console.log('[Alerts] ========== APP OPEN CHECK ==========');
    console.log('[Alerts] Current Time:', new Date().toISOString());
    console.log('[Alerts] User ID:', session.user.id);
    console.log('[Alerts] Initialized:', isInitialized);

    if (shouldFetchAlerts()) {
      console.log('[Alerts] Should fetch - initiating fetch...');
      fetchGlobalAlerts();
    } else {
      console.log('[Alerts] No fetch needed at this time (already fetched in this hour)');
    }
    console.log('[Alerts] =====================================');
  }, [isInitialized, session?.user, shouldFetchAlerts, fetchGlobalAlerts]);

  if (!isInitialized) {
    return null;
  }

  return (
    <AlertsContext.Provider
      value={{
        globalAlerts,
        localAlerts,
        loading,
        error,
        lastFetchTime,
        fetchGlobalAlerts,
        addLocalAlert,
        removeLocalAlert,
        clearGlobalAlerts,
        clearLocalAlerts,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

// Hook
export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

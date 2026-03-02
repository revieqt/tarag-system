import { BACKEND_URL } from '@/constants/Config';

interface EnableSOSResponse {
  message: string;
  data: {
    isInAnEmergency: boolean;
    emergencyType: string;
    emergencyContact?: string;
    locationInfo: {
      name: string;
      address: string;
      city: string;
      country: string;
    };
  };
}

interface DisableSOSResponse {
  message: string;
  data: {
    isInAnEmergency: boolean;
    emergencyType: string;
    emergencyContact?: string;
  };
}

/**
 * Activate SOS/Emergency mode for the user
 * Updates safetyState and sends emergency email if contact provided
 * 
 * @param userID - User ID from SessionContext
 * @param emergencyType - Type of emergency (e.g., "Medical", "Accident", etc.)
 * @param latitude - Current latitude coordinate
 * @param longitude - Current longitude coordinate
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext
 * @param emergencyContact - Optional email address to send alert to
 * @param message - Optional additional message about emergency
 * @returns Response with updated safety state and location info
 */
export const enableSOSService = async (
  userID: string,
  emergencyType: string,
  latitude: number,
  longitude: number,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>,
  emergencyContact?: string,
  message?: string
): Promise<EnableSOSResponse> => {
  try {
    if (!userID || !emergencyType) {
      throw new Error('User ID and Emergency Type are required');
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Valid latitude and longitude coordinates are required');
    }

    console.log('🚨 Calling enableSOS with:', {
      userID,
      emergencyType,
      latitude,
      longitude,
      emergencyContact: emergencyContact ? 'provided' : 'not provided'
    });

    const response = await fetch(`${BACKEND_URL}/api/safety/enable-sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userID,
        emergencyType,
        latitude,
        longitude,
        emergencyContact: emergencyContact || undefined,
        message: message || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to activate SOS');
    }

    console.log('✅ SOS activated successfully');

    // Update SessionContext with the response data
    if (data.data) {
      await updateSession({
        user: {
          safetyState: {
            isInAnEmergency: data.data.isInAnEmergency,
            emergencyType: data.data.emergencyType,
            emergencyContact: data.data.emergencyContact
          }
        }
      });
      console.log('✅ SessionContext updated with new safetyState');
    }

    return data;
  } catch (error) {
    console.error('❌ Error in enableSOSService:', error);
    throw error;
  }
};

/**
 * Deactivate SOS/Emergency mode for the user
 * Clears emergency type and sets isInAnEmergency to false
 * 
 * @param userID - User ID from SessionContext
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext
 * @returns Response with updated safety state
 */
export const disableSOSService = async (
  userID: string,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<DisableSOSResponse> => {
  try {
    if (!userID) {
      throw new Error('User ID is required');
    }

    console.log('🔕 Calling disableSOS with:', { userID });

    const response = await fetch(`${BACKEND_URL}/api/safety/disable-sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userID
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to deactivate SOS');
    }

    console.log('✅ SOS deactivated successfully');

    // Update SessionContext with the response data
    if (data.data) {
      await updateSession({
        user: {
          safetyState: {
            isInAnEmergency: data.data.isInAnEmergency,
            emergencyType: data.data.emergencyType,
            emergencyContact: data.data.emergencyContact
          }
        }
      });
      console.log('✅ SessionContext updated with new safetyState');
    }

    return data;
  } catch (error) {
    console.error('❌ Error in disableSOSService:', error);
    throw error;
  }
};

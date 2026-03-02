import { BACKEND_URL } from '@/constants/Config';

interface UpdateBooleanResponse {
  message: string;
  data: any;
}

interface UpdateStringResponse {
  message: string;
  data: any;
}

interface UploadProfileImageResponse {
  message: string;
  data: any;
}

interface UpdateUserLikesResponse {
  message: string;
  data: any;
}

/**
 * Update a boolean field in the user document
 * @param userId - User ID from SessionContext
 * @param fieldName - The field name to update (e.g., 'visibilitySettings.isProfilePublic')
 * @param value - The boolean value to set
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data if successful
 */
export const updateBooleanUserData = async (
  userId: string,
  fieldName: string,
  value: boolean,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UpdateBooleanResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/update-boolean`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId,
        fieldName,
        value
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update boolean field');
    }

    // Update SessionContext by merging only the affected fields with existing session
    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating boolean user data:', error);
    throw error;
  }
};

/**
 * Update a string field in the user document
 * @param userId - User ID from SessionContext
 * @param fieldName - The field name to update (e.g., 'fname')
 * @param value - The string value to set
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data if successful
 */
export const updateStringUserData = async (
  userId: string,
  fieldName: string,
  value: string,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UpdateStringResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/update-string`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId,
        fieldName,
        value
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update string field');
    }

    // Update SessionContext by merging only the affected fields with existing session
    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating string user data:', error);
    throw error;
  }
};

/**
 * Upload a profile image for the user
 * @param userId - User ID from SessionContext
 * @param imageUri - The URI of the image file (local path)
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @returns Updated user data with new profileImage path if successful
 */
export const uploadProfileImage = async (
  userId: string,
  imageUri: string,
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>
): Promise<UploadProfileImageResponse> => {
  try {
    // Create FormData to send the image
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('image', {
      uri: imageUri,
      name: `profile-${userId}.jpg`,
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${BACKEND_URL}/api/users/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // Note: Don't set Content-Type, let fetch set it with proper boundary for multipart
      },
      body: formData
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to upload profile image');
    }

    // Update SessionContext by merging only the affected fields with existing session
    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Update user's likes array and optionally isFirstLogin field
 * @param likes - Array of category strings that user likes
 * @param accessToken - JWT access token from SessionContext
 * @param updateSession - Function from useSession to update SessionContext with deep merge
 * @param isFirstLoginValue - Optional boolean to update isFirstLogin field
 * @returns Updated user data if successful
 */
export const updateUserLikes = async (
  likes: string[],
  accessToken: string,
  updateSession: (sessionData: any) => Promise<void>,
  isFirstLoginValue?: boolean
): Promise<UpdateUserLikesResponse> => {
  try {
    const requestBody: any = {
      likes
    };

    // Only include isFirstLoginValue if it's provided
    if (typeof isFirstLoginValue === 'boolean') {
      requestBody.isFirstLoginValue = isFirstLoginValue;
    }

    const response = await fetch(`${BACKEND_URL}/api/users/update-likes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update user likes');
    }

    // Update SessionContext by merging only the affected fields with existing session
    if (responseData.data) {
      await updateSession({
        user: responseData.data
      });
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error updating user likes:', error);
    throw error;
  }
};

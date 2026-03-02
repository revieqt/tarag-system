import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

export interface RoomMember {
  userID: string;
  nickname?: string;
  username?: string;
  joinedOn: string;
  status: 'member' | 'invited' | 'waiting';
}

export interface Room {
  id: string;
  name: string;
  roomImage?: string;
  memberCount?: number;
}

export interface RoomDetail {
  name: string;
  inviteCode: string;
  roomImage?: string;
  roomColor: string;
  itineraryID?: string;
  itineraryTitle?: string;
  itineraryStartDate?: string;
  itineraryEndDate?: string;
  chatID: string;
  admins: string[];
  members: RoomMember[];
}

export interface CreateRoomData {
  name: string;
  invitedMembers?: string[];
  itineraryID?: string;
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  inviteCode: string;
  roomColor: string;
  roomImage: string;
  itineraryID: string;
  chatID: string;
  admins: string[];
  members: RoomMember[];
}

/**
 * Get all rooms the user is a member of
 */
export const getRooms = async (): Promise<Room[]> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${BACKEND_URL}/api/rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch rooms');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch rooms');
  }
};

/**
 * Get specific room details by ID
 */
export const getSpecificRoom = async (roomID: string): Promise<RoomDetail> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${BACKEND_URL}/api/rooms/view/${roomID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch room details');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch room details');
  }
};

/**
 * Create a new room
 */
export const createRoom = async (
  roomData: CreateRoomData
): Promise<CreateRoomResponse> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create room');
    }

    const data = await response.json();
    return data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create room');
  }
};

/**
 * Leave a room
 */
export const leaveRoom = async (roomID: string): Promise<void> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(`${BACKEND_URL}/api/rooms/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomID }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to leave room');
    }

    // Success response returns no content (200 with empty body)
  } catch (error: any) {
    throw new Error(error.message || 'Failed to leave room');
  }
};

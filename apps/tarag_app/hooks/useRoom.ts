import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRooms as getRoomsService,
  getSpecificRoom as getSpecificRoomService,
  createRoom as createRoomService,
  leaveRoom as leaveRoomService,
  Room,
  RoomDetail,
  CreateRoomData,
  CreateRoomResponse,
} from '@/services/roomService';

// Query keys for cache management
const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: () => [...roomKeys.lists()] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

/**
 * Hook to fetch all rooms the user is a member of
 */
export function useGetRooms() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: async () => await getRoomsService(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch specific room details by ID
 */
export function useGetSpecificRoom(roomID: string | null) {
  return useQuery({
    queryKey: roomKeys.detail(roomID || ''),
    queryFn: async () => await getSpecificRoomService(roomID!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes (formerly cacheTime)
    enabled: !!roomID,
  });
}

/**
 * Hook to create a new room
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData: CreateRoomData) =>
      await createRoomService(roomData),
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
    },
  });
}

/**
 * Hook to leave a room
 */
export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomID: string) =>
      await leaveRoomService(roomID),
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomKeys.list() });
      // Also invalidate all room details in case user was viewing it
      queryClient.invalidateQueries({ queryKey: roomKeys.details() });
    },
  });
}

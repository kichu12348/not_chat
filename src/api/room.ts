import { apiClient } from './client';
import { API_ENDPOINTS } from '../config';

export const RoomAPI = {
  createRoom: async (): Promise<{ roomId: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_ROOM);
    return response.data;
  },

  joinRoom: async (roomId: string): Promise<{ success: boolean; roomId: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.JOIN_ROOM(roomId));
    return response.data;
  },

  uploadPublicKey: async (roomId: string, publicKeyBase64: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(API_ENDPOINTS.UPLOAD_PUBLIC_KEY(roomId), { publicKey: publicKeyBase64 });
    return response.data;
  },

  getPeerPublicKey: async (roomId: string): Promise<{ publicKey: string | null; userId: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.GET_PUBLIC_KEY(roomId));
    return response.data;
  },
};

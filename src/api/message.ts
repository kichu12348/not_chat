import { apiClient } from './client';
import { API_ENDPOINTS } from '../config';

export interface EncryptedMessagePayload {
  id: string;
  ciphertext: string;
  nonce: string;
  replyToId?: string;
}

export interface MessageResponse {
  id: string;
  roomId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  replyToId?: string;
  timestamp: string;
}

export const MessageAPI = {
  sendMessage: async (roomId: string, payload: EncryptedMessagePayload): Promise<{ success: boolean; message: MessageResponse }> => {
    const response = await apiClient.post(API_ENDPOINTS.SEND_MESSAGE(roomId), payload);
    return response.data;
  },

  getMessages: async (roomId: string, limit: number = 20, offset: number = 0): Promise<{ messages: MessageResponse[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.GET_MESSAGES(roomId, limit, offset));
    return response.data;
  },

  deleteMessage: async (roomId: string, messageId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_MESSAGE(roomId, messageId));
    return response.data;
  }
};

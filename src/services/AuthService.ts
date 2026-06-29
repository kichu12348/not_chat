import { Constants } from '../config';
import { KeyExchange, SecureStorage, Encryption } from '../crypto';
import { useAuthStore } from '../state';

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../config/api';

export const AuthService = {
  login: async (username: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { username });
      const { userId, token } = response.data;

      await SecureStorage.save(Constants.AUTH_TOKEN_KEY, token);
      await SecureStorage.save(Constants.USER_ID_KEY, userId);

      // Generate Keypair
      const privateKey = KeyExchange.generatePrivateKey();
      await SecureStorage.save(Constants.SECURE_STORE_PRIVATE_KEY, Encryption.bytesToBase64(privateKey));

      useAuthStore.getState().setAuth(userId, token);
      return true;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  },

  logout: async () => {
    await SecureStorage.delete(Constants.AUTH_TOKEN_KEY);
    await SecureStorage.delete(Constants.USER_ID_KEY);
    await SecureStorage.delete(Constants.SECURE_STORE_PRIVATE_KEY);
    useAuthStore.getState().logout();
  },

  restoreAuth: async () => {
    const token = await SecureStorage.get(Constants.AUTH_TOKEN_KEY);
    const userId = await SecureStorage.get(Constants.USER_ID_KEY);
    if (token && userId) {
      useAuthStore.getState().setAuth(userId, token);
    }
  }
};

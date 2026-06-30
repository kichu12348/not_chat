import { Constants } from "../config";
import { KeyExchange, SecureStorage, Encryption } from "../crypto";
import { useAuthStore } from "../state";

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../config/api";
import { isAxiosError } from "axios";

export const AuthService = {
  login: async (username: string, password?: string) => {
    if (!password) throw new Error("Password is required");

    try {
      const passwordHash = KeyExchange.hashPasswordForServer(password);
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        username,
        passwordHash,
      });
      const { userId, token, sessionId } = response.data;

      await SecureStorage.save(Constants.AUTH_TOKEN_KEY, token);
      await SecureStorage.save(Constants.USER_ID_KEY, userId);
      await SecureStorage.save(Constants.SESSION_ID_KEY, sessionId);

      // Generate Deterministic Keypair
      const privateKey = KeyExchange.derivePrivateKey(username, password);
      await SecureStorage.save(
        Constants.SECURE_STORE_PRIVATE_KEY,
        Encryption.bytesToBase64(privateKey),
      );

      useAuthStore.getState().setAuth(userId, token);
      return true;
    } catch (e: any) {
      if (isAxiosError(e)) {
        if (e.response?.status === 409) {
          throw new Error("Username already taken. Please try another one.");
        }
        throw new Error(e.response?.data.error || "Login failed");
      }
      throw new Error("Login failed. Please try again.");
    }
  },

  logout: async () => {
    await SecureStorage.delete(Constants.AUTH_TOKEN_KEY);
    await SecureStorage.delete(Constants.USER_ID_KEY);
    await SecureStorage.delete(Constants.SESSION_ID_KEY);
    await SecureStorage.delete(Constants.SECURE_STORE_PRIVATE_KEY);
    useAuthStore.getState().logout();
  },

  restoreAuth: async () => {
    const token = await SecureStorage.get(Constants.AUTH_TOKEN_KEY);
    const userId = await SecureStorage.get(Constants.USER_ID_KEY);
    const sessionId = await SecureStorage.get(Constants.SESSION_ID_KEY);
    
    if (token && userId && sessionId) {
      try {
        await apiClient.post(API_ENDPOINTS.VERIFY, { userId, sessionId });
        useAuthStore.getState().setAuth(userId, token);
      } catch (e: any) {
        if (isAxiosError(e)) {
          if (e.response?.status === 401) {
            await AuthService.logout();
          } else {
            // Network error or other server error, proceed with local auth
            useAuthStore.getState().setAuth(userId, token);
          }
        } else {
          await AuthService.logout();
        }
      }
    } else {
      await AuthService.logout();
    }
  },
};

import axios from 'axios';
import { API_BASE_URL, Constants } from '../config';
import { SecureStorage } from '../crypto';
import { useAuthStore } from '../state';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Constants.REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStorage.get(Constants.AUTH_TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const sessionId = await SecureStorage.get(Constants.SESSION_ID_KEY);
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStorage.delete(Constants.AUTH_TOKEN_KEY);
      await SecureStorage.delete(Constants.USER_ID_KEY);
      await SecureStorage.delete(Constants.SESSION_ID_KEY);
      await SecureStorage.delete(Constants.SECURE_STORE_PRIVATE_KEY);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

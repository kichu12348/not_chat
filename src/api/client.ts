import axios from 'axios';
import { API_BASE_URL, Constants } from '../config';
import { SecureStorage } from '../crypto';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Constants.REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // In a real app we might get the token from a secure store or memory store
    // For this prototype, we're using a dummy "userId" as the token for auth middleware
    const token = await SecureStorage.get(Constants.AUTH_TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

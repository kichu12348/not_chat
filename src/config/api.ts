// Change this IP to your local machine's IP if testing on a physical device,
// or 10.0.2.2 if testing on Android Emulator, or localhost for iOS simulator.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
export const API_BASE_URL = BASE_URL;
export const WS_BASE_URL = BASE_URL.replace("http", "ws");

export const API_ENDPOINTS = {
  LOGIN: "/login",
  CREATE_ROOM: "/rooms",
  JOIN_ROOM: (id: string) => `/rooms/${id}/join`,
  UPLOAD_PUBLIC_KEY: (id: string) => `/rooms/${id}/public-key`,
  GET_PUBLIC_KEY: (id: string) => `/rooms/${id}/public-key`,
  SEND_MESSAGE: (id: string) => `/rooms/${id}/messages`,
  GET_MESSAGES: (id: string, limit: number, offset: number) =>
    `/rooms/${id}/messages?limit=${limit}&offset=${offset}`,
  DELETE_MESSAGE: (roomId: string, messageId: string) =>
    `/rooms/${roomId}/messages/${messageId}`,
};

export const WS_ENDPOINT = (roomId: string) => `/ws/${roomId}`;

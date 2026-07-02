import * as SecureStore from "expo-secure-store";

const cacheMap = new Map<string, string>();

export const SecureStorage = {
  async save(key: string, value: string): Promise<void> {
    cacheMap.set(key, value);
    await SecureStore.setItemAsync(key, value);
  },

  async get(key: string): Promise<string | null> {
    const cached = cacheMap.get(key);
    if (cached) {
      return cached;
    }
    const value = await SecureStore.getItemAsync(key);
    if (value) {
      cacheMap.set(key, value);
    }
    return value;
  },

  async delete(key: string): Promise<void> {
    cacheMap.delete(key);
    await SecureStore.deleteItemAsync(key);
  },
};

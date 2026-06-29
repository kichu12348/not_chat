import { RoomAPI } from '../api';
import { KeyExchange, SecureStorage, Encryption } from '../crypto';
import { Constants } from '../config';
import { useChatStore } from '../state';

export const RoomService = {
  createRoom: async () => {
    const { roomId } = await RoomAPI.createRoom();
    
    // Upload our public key
    const privateKeyBase64 = await SecureStorage.get(Constants.SECURE_STORE_PRIVATE_KEY);
    if (!privateKeyBase64) throw new Error("Private key not found");
    
    const privateKey = Encryption.base64ToBytes(privateKeyBase64);
    const publicKey = KeyExchange.getPublicKey(privateKey);
    await RoomAPI.uploadPublicKey(roomId, Encryption.bytesToBase64(publicKey));
    
    return roomId;
  },

  joinRoom: async (roomId: string) => {
    await RoomAPI.joinRoom(roomId);
    
    // Upload our public key
    const privateKeyBase64 = await SecureStorage.get(Constants.SECURE_STORE_PRIVATE_KEY);
    if (!privateKeyBase64) throw new Error("Private key not found");
    
    const privateKey = Encryption.base64ToBytes(privateKeyBase64);
    const publicKey = KeyExchange.getPublicKey(privateKey);
    await RoomAPI.uploadPublicKey(roomId, Encryption.bytesToBase64(publicKey));
    
    return roomId;
  },

  deriveSharedKey: async (roomId: string) => {
    const { publicKey, userId } = await RoomAPI.getPeerPublicKey(roomId);
    if (!publicKey) return false;

    const privateKeyBase64 = await SecureStorage.get(Constants.SECURE_STORE_PRIVATE_KEY);
    if (!privateKeyBase64) throw new Error("Private key not found");

    const privateKey = Encryption.base64ToBytes(privateKeyBase64);
    const peerPubKey = Encryption.base64ToBytes(publicKey);

    const sharedSecret = KeyExchange.getSharedSecret(privateKey, peerPubKey);
    const aesKey = Encryption.deriveKey(sharedSecret);

    useChatStore.getState().setPeer(userId, publicKey);
    useChatStore.getState().setAesKey(aesKey);
    return true;
  }
};

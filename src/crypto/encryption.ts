import { gcm } from '@noble/ciphers/aes.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export const Encryption = {
  deriveKey(sharedSecret: Uint8Array): Uint8Array {
    // Derive a 32-byte (256-bit) AES key from the shared secret
    const info = new TextEncoder().encode('not-chat-aes-gcm');
    return hkdf(sha256, sharedSecret, undefined, info, 32);
  },

  generateNonce(): Uint8Array {
    const nonce = new Uint8Array(12);
    crypto.getRandomValues(nonce);
    return nonce;
  },

  encrypt(plaintext: string, key: Uint8Array, nonce: Uint8Array): string {
    const cipher = gcm(key, nonce);
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(plaintext);
    const ciphertext = cipher.encrypt(data);
    return bytesToBase64(ciphertext);
  },

  decrypt(ciphertextBase64: string, key: Uint8Array, nonce: Uint8Array): string {
    const cipher = gcm(key, nonce);
    const data = base64ToBytes(ciphertextBase64);
    const plaintext = cipher.decrypt(data);
    const textDecoder = new TextDecoder();
    return textDecoder.decode(plaintext);
  },

  bytesToBase64,
  base64ToBytes
};

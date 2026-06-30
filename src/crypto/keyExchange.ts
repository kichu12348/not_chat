import { x25519 } from "@noble/curves/ed25519.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";

export const KeyExchange = {
  /**
   * Generates a new X25519 private key.
   */
  generatePrivateKey(): Uint8Array {
    return x25519.utils.randomSecretKey();
  },

  /**
   * Derives a deterministic X25519 private key from username and password.
   */
  derivePrivateKey(username: string, password: string): Uint8Array {
    const encoder = new TextEncoder();
    const ikm = encoder.encode(password);
    const salt = encoder.encode(username);
    const info = encoder.encode("notchat-e2e-private-key");
    return hkdf(sha256, ikm, salt, info, 32);
  },

  /**
   * Hashes the password for server authentication without revealing the plaintext.
   */
  hashPasswordForServer(password: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "-notchat-server-auth");
    const hash = sha256(data);
    
    let hex = "";
    for (let i = 0; i < hash.length; i++) {
      hex += hash[i].toString(16).padStart(2, "0");
    }
    return hex;
  },

  /**
   * Derives a public key from a given private key.
   */
  getPublicKey(privateKey: Uint8Array): Uint8Array {
    return x25519.getPublicKey(privateKey);
  },

  /**
   * Derives the shared secret using our private key and their public key.
   */
  getSharedSecret(
    privateKey: Uint8Array,
    peerPublicKey: Uint8Array,
  ): Uint8Array {
    return x25519.getSharedSecret(privateKey, peerPublicKey);
  },
};

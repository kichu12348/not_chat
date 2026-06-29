import { x25519 } from "@noble/curves/ed25519.js";

export const KeyExchange = {
  /**
   * Generates a new X25519 private key.
   */
  generatePrivateKey(): Uint8Array {
    return x25519.utils.randomSecretKey();
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

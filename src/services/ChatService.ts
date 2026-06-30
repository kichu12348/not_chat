import { MessageAPI } from '../api';
import { Encryption } from '../crypto';
import { useChatStore, useAuthStore, ChatMessage } from '../state';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Alert } from 'react-native';

export const ChatService = {
  sendMessage: async (text: string) => {
    const state = useChatStore.getState();
    const { roomId, aesKey, replyingToMessage } = state;
    const { userId } = useAuthStore.getState();
    
    if (!roomId || !userId) return;

    if (!aesKey) {
      Alert.alert(
        "Waiting for Peer",
        "Your message cannot be encrypted and sent until the other person joins the room."
      );
      return;
    }

    const nonce = Encryption.generateNonce();
    const ciphertext = Encryption.encrypt(text, aesKey, nonce);
    const messageId = uuidv4();

    const payload = {
      id: messageId,
      ciphertext,
      nonce: Encryption.bytesToBase64(nonce),
      replyToId: replyingToMessage?.id
    };

    // Optimistic UI update could go here, but we'll wait for server for simplicity 
    // or we can add it here. Let's add it optimistically.
    const tempMessage: ChatMessage = {
      id: messageId,
      roomId,
      senderId: userId,
      text,
      timestamp: new Date().toISOString(),
      isSentByMe: true,
      replyToId: replyingToMessage?.id
    };
    useChatStore.getState().addMessage(tempMessage);
    useChatStore.getState().setReplyingToMessage(null);

    try {
      const response = await MessageAPI.sendMessage(roomId, payload);
      // Backend returns the exact same message payload, store already has it
      // but we can update its timestamp to match backend
      useChatStore.getState().setMessages(
        useChatStore.getState().messages.map(m => m.id === messageId ? {
          ...response.message,
          text,
          isSentByMe: true,
          replyToId: response.message.replyToId
        } : m)
      );
    } catch (e) {
      console.error("Failed to send message", e);
    }
  },

  deleteMessage: async (messageId: string) => {
    const { roomId } = useChatStore.getState();
    if (!roomId) return;
    
    // Optimistic delete
    useChatStore.getState().removeMessage(messageId);
    
    try {
      await MessageAPI.deleteMessage(roomId, messageId);
    } catch (e) {
      console.error("Failed to delete message", e);
      // We could restore it here if it failed, but we'll ignore for simplicity
    }
  },

  fetchMessages: async (roomId: string) => {
    const { aesKey } = useChatStore.getState();
    const { userId } = useAuthStore.getState();
    if (!aesKey || !userId) return;

    useChatStore.getState().setIsFetchingMessages(true);
    try {
      const { messages } = await MessageAPI.getMessages(roomId, 20, 0);
      const decryptedMessages: ChatMessage[] = [];

      for (const msg of messages) {
        try {
          const nonce = Encryption.base64ToBytes(msg.nonce);
          const text = Encryption.decrypt(msg.ciphertext, aesKey, nonce);
          decryptedMessages.push({
            id: msg.id,
            roomId: msg.roomId,
            senderId: msg.senderId,
            text,
            timestamp: msg.timestamp,
            isSentByMe: msg.senderId === userId,
            replyToId: msg.replyToId
          });
        } catch (e) {
          console.error("Failed to decrypt message", msg.id);
        }
      }
      
      const currentMessages = useChatStore.getState().messages;
      
      if (currentMessages.length === 0) {
        useChatStore.getState().setMessages(decryptedMessages);
      } else {
        // Merge messages on reconnect
        const newMessages = [...currentMessages];
        decryptedMessages.forEach(msg => {
          if (!newMessages.find(m => m.id === msg.id)) {
            newMessages.push(msg);
          }
        });
        newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        useChatStore.getState().setMessages(newMessages);
      }

      useChatStore.getState().setHasMoreMessages(messages.length === 20);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    } finally {
      useChatStore.getState().setIsFetchingMessages(false);
    }
  },

  loadMoreMessages: async (roomId: string) => {
    const state = useChatStore.getState();
    const { aesKey, messages: currentMessages, hasMoreMessages, isLoadingMore } = state;
    const { userId } = useAuthStore.getState();
    
    if (!aesKey || !userId || !hasMoreMessages || isLoadingMore) return;

    state.setIsLoadingMore(true);
    try {
      // Use current message count as offset
      const { messages } = await MessageAPI.getMessages(roomId, 20, currentMessages.length);
      
      if (messages.length === 0) {
        state.setHasMoreMessages(false);
        state.setIsLoadingMore(false);
        return;
      }

      const decryptedMessages: ChatMessage[] = [];

      for (const msg of messages) {
        // Prevent duplicate messages just in case
        if (currentMessages.find(m => m.id === msg.id)) continue;

        try {
          const nonce = Encryption.base64ToBytes(msg.nonce);
          const text = Encryption.decrypt(msg.ciphertext, aesKey, nonce);
          decryptedMessages.push({
            id: msg.id,
            roomId: msg.roomId,
            senderId: msg.senderId,
            text,
            timestamp: msg.timestamp,
            isSentByMe: msg.senderId === userId,
            replyToId: msg.replyToId
          });
        } catch (e) {
          console.error("Failed to decrypt old message", msg.id);
        }
      }
      
      state.prependMessages(decryptedMessages);
      state.setHasMoreMessages(messages.length === 20);
    } catch (e) {
      console.error("Failed to load more messages", e);
    } finally {
      useChatStore.getState().setIsLoadingMore(false);
    }
  },

  processIncomingMessage: (msg: any) => {
    const { aesKey } = useChatStore.getState();
    const { userId } = useAuthStore.getState();
    if (!aesKey || !userId) return;

    try {
      const nonce = Encryption.base64ToBytes(msg.nonce);
      const text = Encryption.decrypt(msg.ciphertext, aesKey, nonce);
      useChatStore.getState().addMessage({
        id: msg.id,
        roomId: msg.roomId,
        senderId: msg.senderId,
        text,
        timestamp: msg.timestamp,
        isSentByMe: msg.senderId === userId,
        replyToId: msg.replyToId
      });
    } catch (e) {
      console.error("Failed to decrypt incoming message");
    }
  }
};

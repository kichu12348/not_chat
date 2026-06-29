import { create } from 'zustand';
import { MessageResponse } from '../api';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSentByMe: boolean;
  replyToId?: string | null;
}

interface ChatState {
  roomId: string | null;
  peerUserId: string | null;
  peerPublicKey: string | null;
  aesKey: Uint8Array | null;
  messages: ChatMessage[];
  isConnected: boolean;
  
  setRoom: (roomId: string) => void;
  setPeer: (peerUserId: string, peerPublicKey: string) => void;
  setAesKey: (key: Uint8Array) => void;
  setConnected: (connected: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  removeMessage: (messageId: string) => void;
  clearChat: () => void;
  replyingToMessage: ChatMessage | null;
  setReplyingToMessage: (message: ChatMessage | null) => void;
  hasMoreMessages: boolean;
  setHasMoreMessages: (hasMore: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (isLoading: boolean) => void;
  isFetchingMessages: boolean;
  setIsFetchingMessages: (isFetching: boolean) => void;
  isPeerTyping: boolean;
  setIsPeerTyping: (isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  roomId: null,
  peerUserId: null,
  peerPublicKey: null,
  aesKey: null,
  messages: [],
  isConnected: false,
  replyingToMessage: null,
  hasMoreMessages: true,
  isLoadingMore: false,
  isFetchingMessages: false,
  isPeerTyping: false,

  setRoom: (roomId) => set({ roomId }),
  setPeer: (peerUserId, peerPublicKey) => set({ peerUserId, peerPublicKey }),
  setAesKey: (aesKey) => set({ aesKey }),
  setConnected: (isConnected) => set({ isConnected }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages.filter(m => m.id !== message.id), message].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  })),
  setMessages: (messages) => set({ messages }),
  prependMessages: (messages) => set((state) => ({
    // We prepend older messages to the beginning. The array is sorted oldest to newest.
    // If we fetch old messages, their timestamps are older than current ones.
    messages: [...messages, ...state.messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  })),
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter((m) => m.id !== messageId),
  })),
  setReplyingToMessage: (message) => set({ replyingToMessage: message }),
  setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
  setIsLoadingMore: (isLoading) => set({ isLoadingMore: isLoading }),
  setIsFetchingMessages: (isFetching) => set({ isFetchingMessages: isFetching }),
  setIsPeerTyping: (isTyping) => set({ isPeerTyping: isTyping }),
  clearChat: () => set({
    roomId: null,
    peerUserId: null,
    peerPublicKey: null,
    aesKey: null,
    messages: [],
    isConnected: false,
    replyingToMessage: null,
    hasMoreMessages: true,
    isLoadingMore: false,
    isFetchingMessages: false,
    isPeerTyping: false,
  }),
}));

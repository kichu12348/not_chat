import { WS_ENDPOINT, WS_BASE_URL } from "../config";
import { useChatStore, useAuthStore } from "../state";
import { ChatService } from "./ChatService";
import { RoomService } from "./RoomService";

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private roomId: string | null = null;

  connect(roomId: string) {
    this.roomId = roomId;
    const token = useAuthStore.getState().token;

    // In React Native, WebSocket is globally available
    // Passing token via query param for this prototype
    this.ws = new WebSocket(
      `${WS_BASE_URL}${WS_ENDPOINT(roomId)}?token=${token}`,
    );

    this.ws.onopen = () => {
      useChatStore.getState().setConnected(true);
      // Fetch offline messages upon connect
      ChatService.fetchMessages(roomId);
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const myUserId = useAuthStore.getState().token;

        if (data.type === "message") {
          if (data.data.senderId !== myUserId) {
            ChatService.processIncomingMessage(data.data);
          }
        } else if (data.type === "message_deleted") {
          useChatStore.getState().removeMessage(data.data.messageId);
        } else if (data.type === "public_key_updated") {
          // Other user joined or updated key, re-derive shared secret
          if (data.userId !== myUserId) {
            RoomService.deriveSharedKey(roomId);
          }
        } else if (data.type === "typing_start") {
          if (data.senderId !== myUserId) {
            useChatStore.getState().setIsPeerTyping(true);
          }
        } else if (data.type === "typing_stop") {
          if (data.senderId !== myUserId) {
            useChatStore.getState().setIsPeerTyping(false);
          }
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    this.ws.onclose = () => {
      useChatStore.getState().setConnected(false);
      this.reconnect();
    };

    this.ws.onerror = (e) => {
      console.error("WebSocket Error", e);
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect loop
      this.ws.close();
      this.ws = null;
    }
    useChatStore.getState().setConnected(false);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private reconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.roomId) this.connect(this.roomId);
    }, 3000);
  }

  sendTypingStatus(isTyping: boolean) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: isTyping ? "typing_start" : "typing_stop",
        senderId: useAuthStore.getState().token,
      }));
    }
  }
}

export const WebSocketService = new WebSocketManager();

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

    if (!token) {
      useAuthStore.getState().logout();
      return;
    }

    this.ws = new WebSocket(`${WS_BASE_URL}${WS_ENDPOINT(roomId, token)}`);

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

    this.ws.onerror = () => {
      useChatStore.getState().setConnected(false);
      this.reconnect();
      // console.error("WebSocket Error", e);
      // Do not manually close here to avoid throwing an error if it failed to connect.
      // The onclose event will naturally fire after onerror and trigger reconnect.
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
    if (!this.roomId || !useAuthStore.getState().token) return;
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.roomId!);
    }, 3000);
  }

  sendTypingStatus(isTyping: boolean) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: isTyping ? "typing_start" : "typing_stop",
          senderId: useAuthStore.getState().token,
        }),
      );
    }
  }
}

export const WebSocketService = new WebSocketManager();

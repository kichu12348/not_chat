import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { ChatService, WebSocketService, RoomService } from "../../services";
import { Theme } from "../../theme";
import { useChatStore } from "../../state";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";

export const ChatScreen = () => {
  const [text, setText] = useState("");
  const messages = useChatStore((state) => state.messages);
  const roomId = useChatStore((state) => state.roomId);
  const aesKey = useChatStore((state) => state.aesKey);
  const isConnected = useChatStore((state) => state.isConnected);
  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useChatStore(
    (state) => state.setReplyingToMessage,
  );
  const isLoadingMore = useChatStore((state) => state.isLoadingMore);
  const isFetchingMessages = useChatStore((state) => state.isFetchingMessages);
  const isPeerTyping = useChatStore((state) => state.isPeerTyping);
  const netInfo = useNetInfo();
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    if (roomId) {
      WebSocketService.connect(roomId);
    }
    return () => {
      WebSocketService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    let interval: any;
    if (roomId && !aesKey) {
      interval = setInterval(async () => {
        const derived = await RoomService.deriveSharedKey(roomId);
        if (derived && interval) clearInterval(interval);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [roomId, aesKey]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    
    if (!aesKey) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      WebSocketService.sendTypingStatus(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      WebSocketService.sendTypingStatus(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim() || !aesKey) return;
    ChatService.sendMessage(text.trim());
    setText("");
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      WebSocketService.sendTypingStatus(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.isSentByMe;
    const repliedMsg = item.replyToId
      ? messages.find((m) => m.id === item.replyToId)
      : null;

    return (
      <TouchableOpacity
        style={[
          styles.messageBubble,
          isMe ? styles.messageMe : styles.messageThem,
        ]}
        onLongPress={() => {
          const options = [
            { text: "Reply", onPress: () => setReplyingToMessage(item) },
          ];
          if (isMe) {
            options.push({
              text: "Delete",
              onPress: () => ChatService.deleteMessage(item.id),
            });
          }
          options.push({ text: "Cancel", style: "cancel" } as any);

          Alert.alert("Message", "What would you like to do?", options);
        }}
        activeOpacity={0.8}
      >
        {repliedMsg && (
          <View
            style={[
              styles.repliedBubble,
              isMe ? styles.repliedBubbleMe : styles.repliedBubbleThem,
            ]}
          >
            <Text style={styles.replyLabel}>
              {repliedMsg.isSentByMe ? "You" : "Peer"}
            </Text>
            <Text
              style={[
                styles.replyText,
                isMe && { color: Theme.colors.textInverted },
              ]}
              numberOfLines={1}
            >
              {repliedMsg.text}
            </Text>
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            isMe && { color: Theme.colors.textInverted },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[styles.messageTime, isMe && { color: "rgba(0,0,0,0.5)" }]}
        >
          {format(new Date(item.timestamp), "h:mm a")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            useChatStore.getState().clearChat();
            navigation.goBack();
          }}
        >
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>{roomId}</Text>
          <View style={styles.statusContainer}>
            <Icon
              name={isConnected ? "wifi" : "wifi-off"}
              size={12}
              color={isConnected ? Theme.colors.text : Theme.colors.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Connected" : "Connecting..."}
            </Text>
            {isConnected &&
              netInfo.type &&
              netInfo.type !== "none" &&
              netInfo.type !== "unknown" && (
                <Text style={styles.statusText}>
                  {" "}
                  • {netInfo.type === "cellular" ? "CELL" : "WIFI"}
                  {netInfo.type === "wifi" &&
                  (netInfo.details as any)?.strength != null
                    ? ` ${(netInfo.details as any).strength}%`
                    : ""}
                  {netInfo.type === "cellular" &&
                  (netInfo.details as any)?.cellularGeneration != null
                    ? ` ${(netInfo.details as any).cellularGeneration.toUpperCase()}`
                    : ""}
                </Text>
              )}
            {!aesKey && (
              <Text style={styles.statusText}> | Waiting for peer...</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={(w, h) => {
          if (!isLoadingMore) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        refreshing={isLoadingMore}
        onRefresh={() => roomId && ChatService.loadMoreMessages(roomId)}
      />

      {replyingToMessage && (
        <View style={styles.replyingToContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyLabel}>
              Replying to {replyingToMessage.isSentByMe ? "Yourself" : "Peer"}
            </Text>
            <Text style={styles.replyTextPreview} numberOfLines={1}>
              {replyingToMessage.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setReplyingToMessage(null)}
            style={{ padding: 4 }}
          >
            <Icon name="x" size={20} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {isPeerTyping && (
        <View style={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 4 }}>
          <Text style={{ ...Theme.typography.caption, color: Theme.colors.textMuted, fontStyle: "italic" }}>
            Peer is typing...
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : Theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder={
              !aesKey
                ? "Waiting for peer..."
                : isFetchingMessages
                  ? "Syncing messages..."
                  : "Message..."
            }
            placeholderTextColor={Theme.colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            editable={!!aesKey && !isFetchingMessages}
            multiline={true}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !aesKey || isFetchingMessages || !text.trim()
                ? styles.sendDisabled
                : null,
            ]}
            onPress={handleSend}
            disabled={!aesKey || isFetchingMessages || !text.trim()}
          >
            <Icon name="arrow-up" size={16} color={Theme.colors.textInverted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerRight: {
    width: 24, // to balance the chevron width for center alignment
    padding: Theme.spacing.xs,
  },
  headerText: {
    ...Theme.typography.title,
    color: Theme.colors.text,
    letterSpacing: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
  },
  listContent: {
    padding: Theme.spacing.md,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: 16, // Softer on the chat bubbles
    marginVertical: Theme.spacing.xs,
  },
  messageMe: {
    alignSelf: "flex-end",
    backgroundColor: Theme.colors.messageSent,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: "flex-start",
    backgroundColor: Theme.colors.messageReceived,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    lineHeight: 22,
  },
  messageTime: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    // borderTopWidth: 1,
    // borderTopColor: Theme.colors.border,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end", // Anchors everything to the bottom
    backgroundColor: Theme.colors.surface, // Use surface color for a slight contrast
    borderRadius: 24, // Pill shape
    paddingHorizontal: 12,
    paddingVertical: 6,
    paddingRight: 6,
  },
  textInput: {
    flex: 1,
    color: Theme.colors.text,
    ...Theme.typography.body,
    paddingTop: Platform.OS === "ios" ? 8 : 0,
    paddingBottom: Platform.OS === "ios" ? 8 : 0,
    minHeight: 36, // Forces 1 line to have a nice height
    maxHeight: 120, // Prevents taking over the screen
    textAlignVertical: "center",
  },
  sendButton: {
    backgroundColor: Theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendDisabled: {
    backgroundColor: Theme.colors.secondary,
  },
  replyingToContainer: {
    flexDirection: "row",
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: "center",
  },
  replyLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    fontWeight: "bold",
    marginBottom: 2,
  },
  replyTextPreview: {
    ...Theme.typography.caption,
    color: Theme.colors.text,
  },
  repliedBubble: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  repliedBubbleMe: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderLeftColor: "rgba(0,0,0,0.3)",
  },
  repliedBubbleThem: {
    backgroundColor: Theme.colors.surface,
    borderLeftColor: Theme.colors.textMuted,
  },
  replyText: {
    ...Theme.typography.caption,
    color: Theme.colors.text,
  },
});

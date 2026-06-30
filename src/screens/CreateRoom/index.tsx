import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Button } from "../../components";
import { RoomService } from "../../services";
import { Theme } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChatStackParamList } from "../../navigation";
import { useChatStore } from "../../state";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

export const CreateRoomScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const code = await RoomService.createRoom();
      setRoomCode(code);
      useChatStore.getState().setRoom(code);
    } catch (e) {
      setError(e.response?.data.error || "Error while creating room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterChat = async () => {
    setIsEntering(true);
    setError(null);
    try {
      const success = await RoomService.deriveSharedKey(roomCode!);
      if (!success) {
        setError("No Peer in Room");
        return;
      }
      navigation.replace("Chat");
    } catch (e) {
      setError(e.response?.data?.error || "Waiting for peer to join...");
    } finally {
      setIsEntering(false);
    }
  };

  const handleCopy = async () => {
    if (!roomCode) return;
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {!roomCode ? (
          <>
            <Icon
              name="shield"
              size={48}
              color={Theme.colors.text}
              style={styles.icon}
            />
            <Text style={styles.title}>CREATE ROOM</Text>
            <Text style={styles.subtitle}>
              Generate a secure 6-letter code.
            </Text>
            <View style={{ marginTop: 24, width: "100%" }}>
              <Button
                title="Generate"
                icon="key"
                onPress={handleCreate}
                isLoading={isLoading}
              />
            </View>
          </>
        ) : (
          <>
            <Icon
              name="check-circle"
              size={48}
              color={Theme.colors.success}
              style={styles.icon}
            />
            <Text style={styles.title}>ROOM READY</Text>
            <Text style={styles.subtitle}>Share this code:</Text>

            <TouchableOpacity
              style={styles.codeContainer}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={styles.codeText}>{roomCode}</Text>
              <Icon
                name={copied ? "check" : "copy"}
                size={20}
                color={copied ? Theme.colors.success : Theme.colors.textMuted}
                style={styles.copyIcon}
              />
            </TouchableOpacity>

            {error && (
              <View style={styles.errorContainer}>
                <Icon
                  name="alert-circle"
                  size={16}
                  color={Theme.colors.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={{ width: "100%", marginTop: error ? 8 : 0 }}>
              <Button
                title="Enter Chat"
                icon="message-square"
                onPress={handleEnterChat}
                isLoading={isEntering}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Theme.colors.background,
  },
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: Theme.spacing.xl,
  },
  header: {
    width: "100%",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-start",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  icon: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.title,
    color: Theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  codeContainer: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    borderRadius: 6,
    marginBottom: Theme.spacing.xl,
    alignItems: "center",
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderStyle: "dashed",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  codeText: {
    ...Theme.typography.header,
    color: Theme.colors.text,
    letterSpacing: 8,
  },
  copyIcon: {
    position: "absolute",
    right: Theme.spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: Theme.spacing.sm,
    borderRadius: 8,
    marginBottom: Theme.spacing.lg,
    width: "100%",
    justifyContent: "center",
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.error,
    marginLeft: 8,
  },
});

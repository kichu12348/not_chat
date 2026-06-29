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

export const CreateRoomScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const code = await RoomService.createRoom();
      setRoomCode(code);
      useChatStore.getState().setRoom(code);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterChat = () => {
    navigation.replace("Chat");
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
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{roomCode}</Text>
            </View>
            <View style={{ width: "100%" }}>
              <Button
                title="Enter Chat"
                icon="message-square"
                onPress={handleEnterChat}
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
  },
  codeText: {
    ...Theme.typography.header,
    color: Theme.colors.text,
    letterSpacing: 8,
  },
});

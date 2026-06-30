import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Input } from "../../components";
import { RoomService } from "../../services";
import { Theme } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChatStackParamList } from "../../navigation";
import { useChatStore } from "../../state";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const platform = Platform.OS;

export const JoinRoomScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const code = await RoomService.joinRoom(roomCode.trim().toUpperCase());
      useChatStore.getState().setRoom(code);
      await RoomService.deriveSharedKey(code);
      navigation.replace("Chat");
    } catch (e: any) {
      setError(
        e.response?.data?.error || "Failed to join. Room full or missing.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    if (error) id = setTimeout(() => setError(""), 4000);
    return () => id && clearTimeout(id);
  }, [error]);

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

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <Icon
            name="link"
            size={48}
            color={Theme.colors.text}
            style={styles.icon}
          />
          <Text style={styles.title}>JOIN ROOM</Text>

          <View style={{ width: "100%", marginTop: Theme.spacing.lg }}>
            {!!error && (
              <View style={styles.errorContainer}>
                <Icon
                  name="alert-triangle"
                  size={16}
                  color={Theme.colors.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              placeholder="e.g. A8KXQ9"
              value={roomCode}
              onChangeText={(text) => setRoomCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              textAlign="center"
              style={{ letterSpacing: 4, ...Theme.typography.title }}
            />

            <View style={{ marginTop: Theme.spacing.md }}>
              <Button
                title="Connect"
                icon="arrow-right"
                onPress={handleJoin}
                isLoading={isLoading}
                disabled={roomCode.trim().length < 6}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: Theme.spacing.xl,
  },
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: Theme.spacing.md,
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
  title: {
    ...Theme.typography.title,
    color: Theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});

import React, { useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Input } from "../../components";
import { AuthService } from "../../services";
import { Theme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const platform = Platform.OS;

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    try {
      await AuthService.login(username);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>NOTCHAT</Text>
        <Text style={styles.subtitle}>E2E Encrypted</Text>

        <View style={styles.form}>
          <Input
            placeholder="Enter a username..."
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <View style={styles.buttonWrapper}>
            <Button
              title="Start"
              icon="arrow-right"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!username.trim()}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Theme.colors.background,
  },
  title: {
    ...Theme.typography.header,
    color: Theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 4,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xxl,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  form: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  buttonWrapper: {
    marginTop: Theme.spacing.md,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: Theme.spacing.xl,
  },
});

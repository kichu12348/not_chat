import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Input } from "../../components";
import { AuthService } from "../../services";
import { Theme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.login(username.trim(), password.trim());
    } catch (e: any) {
      setError(e.message || "Failed to start");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
            onChangeText={(text) => {
              setUsername(text.toLowerCase());
              if (error) setError(null);
            }}
            autoCapitalize="none"
          />
          <View style={{ height: Theme.spacing.md }} />
          <Input
            placeholder="Enter a password..."
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null);
            }}
            isSecret={true}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color={Theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonWrapper}>
            <Button
              title="Start"
              icon="arrow-right"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!username.trim() || !password.trim()}
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.error + "1A", // 10% opacity
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.error + "33", // 20% opacity
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.error,
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
});

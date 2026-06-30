import "react-native-get-random-values";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { StatusBar } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { RootNavigator } from "./src/navigation";
import { Theme } from "./src/theme";
import { ScreenshotWarning } from "./src/components";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import * as ScreenCapture from "expo-screen-capture";

SplashScreen.preventAutoHideAsync();

async function onFetchUpdateAsync() {
  if (__DEV__) {
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {}
}

enableScreens();

export default function App() {
  useEffect(() => {
    onFetchUpdateAsync().finally(() => {
      SplashScreen.hideAsync();
    });

    // Prevent screen capture globally
    ScreenCapture.preventScreenCaptureAsync();
  }, []);

  return (
    <GestureHandlerRootView
      style={{ backgroundColor: Theme.colors.background, flex: 1 }}
    >
      <SafeAreaProvider>
        <KeyboardProvider preload={false}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Theme.colors.background}
          />
          <RootNavigator />
          <ScreenshotWarning />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import "react-native-get-random-values";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { StatusBar } from "react-native";
import { RootNavigator } from "./src/navigation";
import { Theme } from "./src/theme";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";

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
  }, []);
  return (
    <GestureHandlerRootView
      style={{ backgroundColor: Theme.colors.background, flex: 1 }}
    >
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Theme.colors.background}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

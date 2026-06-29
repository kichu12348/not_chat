import React, { useEffect, useState } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { AuthNavigator } from "./AuthNavigator";
import { ChatNavigator } from "./ChatNavigator";
import { useAuthStore } from "../state";
import { AuthService } from "../services";
import { View, ActivityIndicator } from "react-native";
import { Theme } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Theme.colors.background,
  },
};

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      await AuthService.restoreAuth();
      setIsRestoring(false);
    };
    restore();
  }, []);

  if (isRestoring) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.colors.background } }}>
        {token ? (
          <Stack.Screen name="ChatRoot" component={ChatNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as ScreenCapture from "expo-screen-capture";
import { Theme } from "../theme";
import Animated, { FadeOut } from "react-native-reanimated";

export const ScreenshotWarning = () => {
  const [busted, setBusted] = useState(false);

  ScreenCapture.useScreenshotListener(() => {
    setBusted(true);
    setTimeout(() => {
      setBusted(false);
    }, 4000);
  });

  if (!busted) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(200)}
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: 20,
        },
      ]}
    >
      <Icon name="camera-off" size={100} color={Theme.colors.primary} />
      <Text
        style={{
          ...Theme.typography.header,
          color: Theme.colors.primary,
          marginTop: 30,
          textAlign: "center",
        }}
      >
        NUH UHH!
      </Text>
    </Animated.View>
  );
};

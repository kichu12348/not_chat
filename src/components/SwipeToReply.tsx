import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Feather";
import { Theme } from "../theme";

interface Props {
  children: React.ReactNode;
  onReply: () => void;
  enabled?: boolean;
  isMe: boolean;
}

const SWIPE_THRESHOLD = 60;
const MAX_SWIPE = 80;

export const SwipeToReply = ({
  children,
  onReply,
  enabled = true,
  isMe,
}: Props) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX(isMe ? [-1000, -20] : [20, 1000]) // Left swipe for isMe, Right swipe for !isMe
    .failOffsetY([-5, 5]) // Fail fast if user scrolls vertically
    .onUpdate((e) => {
      if (isMe) {
        // Swipe left
        translateX.value = Math.max(
          Math.min(e.translationX * 0.6, 0),
          -MAX_SWIPE,
        );
      } else {
        // Swipe right
        translateX.value = Math.min(
          Math.max(e.translationX * 0.6, 0),
          MAX_SWIPE,
        );
      }
    })
    .onEnd(() => {
      const distance = Math.abs(translateX.value);
      if (distance > SWIPE_THRESHOLD) {
        runOnJS(onReply)();
      }
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const distance = Math.abs(translateX.value);
    const scale = interpolate(
      distance,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      distance,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { alignItems: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isMe ? { right: Theme.spacing.md } : { left: Theme.spacing.md },
          iconStyle,
        ]}
      >
        <View style={styles.iconCircle}>
          <Icon
            name={isMe ? "corner-up-right" : "corner-up-left"}
            size={16}
            color={Theme.colors.textInverted}
          />
        </View>
      </Animated.View>

      {/* GestureDetector only wraps the content so empty row space doesn't intercept touches */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: "100%", // Full width so the icon can sit at the edges
  },
  iconContainer: {
    position: "absolute",
    zIndex: -1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

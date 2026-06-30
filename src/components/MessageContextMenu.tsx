import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  Easing,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Feather";
import { Theme } from "../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ContextMenuOption {
  icon: string;
  text: string;
  color?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  options: ContextMenuOption[];
  messagePreview?: React.ReactNode;
}

export const MessageContextMenu = ({
  visible,
  onClose,
  options,
  messagePreview,
}: Props) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        entering={SlideInDown.duration(350).easing(
          Easing.bezier(0.25, 1, 0.5, 1),
        )}
        exiting={SlideOutDown.duration(250).easing(
          Easing.bezier(0.5, 0, 0.75, 0),
        )}
        style={[
          styles.sheetContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : Theme.spacing.lg,
          },
        ]}
      >
        {messagePreview && (
          <View style={styles.messagePreviewContainer}>{messagePreview}</View>
        )}
        <View style={styles.card}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              style={[
                styles.optionRow,
                i === options.length - 1 && styles.lastOption,
              ]}
              onPress={() => {
                onClose();
                setTimeout(opt.onPress, 250);
              }}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={opt.icon}
                  size={20}
                  color={opt.color || Theme.colors.text}
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: opt.color || Theme.colors.text },
                ]}
              >
                {opt.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  messagePreviewContainer: {
    marginBottom: 16, // spacing between preview and options
    width: "100%",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    ...Theme.typography.body,
    marginLeft: 12,
    fontSize: 17,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelText: {
    ...Theme.typography.body,
    color: Theme.colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
});

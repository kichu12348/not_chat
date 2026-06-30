import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Theme } from "../theme";

interface InputProps extends TextInputProps {
  label?: string;
  isSecret?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  isSecret = false,
  style,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            props.multiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={Theme.colors.textMuted}
          secureTextEntry={isSecret && !isVisible}
          {...props}
        />
        {isSecret && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsVisible(!isVisible)}
            activeOpacity={0.7}
          >
            <Icon
              name={isVisible ? "eye-off" : "eye"}
              size={20}
              color={Theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: Theme.spacing.xs,
  },
  inputWrapper: {
    backgroundColor: Theme.colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    color: Theme.colors.text,
    ...Theme.typography.caption,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    ...Theme.typography.body,
  },
  inputMultiline: {
    minHeight: 40,
    paddingTop: 10,
  },
  eyeIcon: {
    padding: Theme.spacing.sm,
    paddingRight: Theme.spacing.md,
  },
});

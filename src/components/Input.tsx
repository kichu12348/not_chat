import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { Theme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input, 
          error ? styles.inputError : null,
          props.multiline && styles.inputMultiline,
          style
        ]}
        placeholderTextColor={Theme.colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Theme.spacing.xs,
  },
  label: {
    color: Theme.colors.text,
    ...Theme.typography.caption,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 6, // Sharper corners
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.typography.body,
  },
  inputMultiline: {
    minHeight: 40,
    paddingTop: 10, 
  },
  inputError: {
    borderColor: Theme.colors.error,
  },
  errorText: {
    color: Theme.colors.error,
    ...Theme.typography.caption,
    marginTop: 4,
  },
});

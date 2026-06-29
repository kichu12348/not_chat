import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Theme } from '../theme';
import Icon from 'react-native-vector-icons/Feather';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', isLoading, disabled, icon }) => {
  const getBgColor = () => {
    switch (variant) {
      case 'secondary': return Theme.colors.secondary;
      case 'danger': return Theme.colors.background;
      case 'ghost': return 'transparent';
      default: return Theme.colors.primary; // White
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return Theme.colors.textInverted; // Black text
      case 'danger': return Theme.colors.text;
      case 'ghost': return Theme.colors.text;
      default: return Theme.colors.text; // White text for secondary
    }
  };

  const getBorderColor = () => {
    if (variant === 'danger' || variant === 'ghost' || variant === 'secondary') {
      return Theme.colors.border;
    }
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBgColor(), 
          borderColor: getBorderColor(),
          borderWidth: (variant === 'danger' || variant === 'ghost' || variant === 'secondary') ? 1 : 0,
          opacity: disabled || isLoading ? 0.4 : 1 
        }
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={18} color={getTextColor()} style={styles.icon} />}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: 6, // Sharper corners for monochrome feel
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: Theme.spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    ...Theme.typography.body,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

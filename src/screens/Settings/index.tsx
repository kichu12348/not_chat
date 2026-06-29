import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Theme } from '../../theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.xl,
    justifyContent: 'center',
    backgroundColor: Theme.colors.background,
  },
  title: {
    ...Theme.typography.header,
    color: Theme.colors.text,
    textAlign: 'center',
  },
});

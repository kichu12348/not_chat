import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../components';
import { AuthService } from '../../services';
import { Theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../../navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>NOTCHAT</Text>
      <Text style={styles.subtitle}>Secure Comms</Text>

      <View style={styles.actions}>
        <Button title="Create Room" icon="plus" onPress={() => navigation.navigate('CreateRoom')} />
        <Button title="Join Room" icon="log-in" variant="secondary" onPress={() => navigation.navigate('JoinRoom')} />
      </View>
      
      <View style={{ marginTop: Theme.spacing.xxl, width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <Button title="Logout" icon="log-out" variant="ghost" onPress={AuthService.logout} />
      </View>
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
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 4,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xxl,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  actions: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  }
});

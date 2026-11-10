import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { router } from 'expo-router';
import { Mascot } from './Mascot';
import { colors } from '../constants/theme';

export function EmptyState({ message, action = true }: { message: string; action?: boolean }) {
  return (
    <View style={styles.box}>
      <Mascot size={96} />
      <Text style={styles.msg}>{message}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={() => router.push('/emotion')}>
          <Text style={styles.link}>마음 기록하기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 32 },
  msg: { textAlign: 'center', fontSize: 14, lineHeight: 22, color: colors.textSoft, marginTop: 10 },
  link: { marginTop: 12, fontSize: 15, fontWeight: '800', color: colors.primary },
});

import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { router } from 'expo-router';
import { Icon } from './Icon';
import { colors, titleFont } from '../constants/theme';

export function Header({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        hitSlop={10}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.back}
      >
        <Icon name="back" />
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 16 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { ...titleFont, marginLeft: 6, fontSize: 18, color: colors.text },
});

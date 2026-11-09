import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export function PrimaryButton({ label, onPress, disabled, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={[styles.btn, variant === 'secondary' && styles.secondary, disabled && styles.disabled]}
    >
      <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  secondary: { backgroundColor: '#efe9fb' },
  disabled: { backgroundColor: '#d9d2ea' },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryText: { color: colors.primary },
});

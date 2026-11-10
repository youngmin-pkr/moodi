import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, brandFont } from '../constants/theme';

export function Wordmark({ size = 44 }: { size?: number }) {
  return (
    <Text accessibilityRole="header" accessibilityLabel="MOODI" style={[styles.wordmark, { fontSize: size, letterSpacing: size / 8 }]}>
      MOODI
    </Text>
  );
}

export function Field({ label, error, ...input }: { label: string; error?: string | null } & TextInputProps) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#b3abc4"
        style={[styles.input, error ? styles.inputError : null]}
        autoCapitalize="none"
        autoCorrect={false}
        {...input}
      />
      <Text style={styles.error} accessibilityLiveRegion="polite">
        {error ?? ' '}
      </Text>
    </View>
  );
}

export function CheckRow({ checked, onChange, label, error }: { checked: boolean; onChange: (v: boolean) => void; label: string; error?: boolean }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} onPress={() => onChange(!checked)} style={styles.checkRow}>
      <View style={[styles.box, checked && styles.boxOn, error && !checked && styles.boxError]}>{checked && <Text style={styles.tick}>✓</Text>}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={[styles.required, error && !checked && { color: colors.danger }]}>필수 항목</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wordmark: { ...brandFont, color: colors.primary, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  inputError: { borderColor: colors.danger },
  error: { fontSize: 12, color: colors.danger, marginTop: 5, minHeight: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8, minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  boxOn: { backgroundColor: colors.primary },
  boxError: { borderColor: colors.danger },
  tick: { position: 'absolute', color: '#fff', fontWeight: '900', fontSize: 15 },
  checkLabel: { fontSize: 14, color: colors.text, marginTop: 2 },
  required: { fontSize: 12, color: colors.primary, marginTop: 4 },
});

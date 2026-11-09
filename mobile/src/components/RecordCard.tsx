import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
import { EMOTIONS } from '../constants/emotions';
import { colors } from '../constants/theme';
import { dateText } from '../lib/date';
import { DiaryRecord } from '../types';

export function openRecord(id: string) {
  router.push({ pathname: '/record/[id]', params: { id } });
}

export function RecordCard({ record, featured }: { record: DiaryRecord; featured?: boolean }) {
  const e = EMOTIONS[record.emotion];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dateText(record.date, false)} ${e.name} ${record.title}`}
      onPress={() => openRecord(record.id)}
      style={[styles.card, featured && styles.featured]}
    >
      <Mascot emotion={record.emotion} size={featured ? 76 : 64} />
      <View style={styles.copy}>
        <View style={styles.meta}>
          <Text style={styles.date}>{dateText(record.date, false)}</Text>
          {featured && (
            <View style={[styles.tag, { backgroundColor: e.soft }]}>
              <Text style={styles.tagText}>{e.name}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
        <Text style={styles.line} numberOfLines={1}>{record.body.split('\n')[0]}</Text>
      </View>
      <Icon name="next" size={18} color={colors.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  featured: { paddingVertical: 18 },
  copy: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, color: colors.textSoft },
  tag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, fontWeight: '700', color: colors.text },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 },
  line: { fontSize: 13, color: colors.textSoft, marginTop: 3 },
});

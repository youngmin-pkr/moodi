import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { router } from 'expo-router';
import { Mascot } from './Mascot';
import { colors } from '../constants/theme';
import { storedComfort } from '../lib/companion';
import { DiaryRecord } from '../types';

/** 구름의 한마디. onChat을 주면 "구름과 이야기하기" 버튼도 보여 줍니다. */
export function ComfortCard({ record, label = '구름의 한마디', chat = false }: { record: DiaryRecord; label?: string; chat?: boolean }) {
  const msg = storedComfort(record);
  const hasChat = (record.chat?.length ?? 0) > 0;
  return (
    <View style={[styles.card, msg.crisis && styles.crisis]} accessibilityLabel={`${label}. ${msg.text}`}>
      <View style={styles.top}>
        <Mascot emotion={record.emotion} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, msg.crisis && { color: colors.danger }]}>{msg.crisis ? '도움이 필요할 때' : label}</Text>
          <Text style={styles.text}>{msg.text}</Text>
        </View>
      </View>
      {chat && (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/chat/[id]', params: { id: record.id } })} style={styles.btn}>
          <Text style={styles.btnText}>{hasChat ? '이어서 이야기하기' : '구름과 이야기하기'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f1eafb', borderRadius: 22, padding: 16, gap: 12 },
  crisis: { backgroundColor: '#fff1f2', borderWidth: 1.5, borderColor: '#f3b6bb' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  text: { fontSize: 14, lineHeight: 21, color: colors.text },
  btn: { minHeight: 44, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  btnText: { fontSize: 14, fontWeight: '800', color: colors.primary },
});

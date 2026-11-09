import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mascot } from '../../components/Mascot';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EMOTIONS } from '../../constants/emotions';
import { colors } from '../../constants/theme';
import { dateText } from '../../lib/date';
import { sortRecords } from '../../lib/records';
import { useRecords } from '../../state/RecordsContext';

// 4단계에서 스토리보드의 홈 화면 전체(오늘 기록, 한마디 등)로 다듬습니다.
export default function Home() {
  const { records, profile } = useRecords();
  const latest = sortRecords(records).slice(0, 5);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>MOODI</Text>
        <Text style={styles.hello}>{profile.name}님, 오늘의 기분은 어떤가요?</Text>
        <View style={styles.hero}>
          <Mascot size={130} />
        </View>
        <PrimaryButton label="오늘의 감정 기록하기" onPress={() => router.push('/emotion')} />
        <Text style={styles.section}>최근 기록</Text>
        {latest.map((r) => (
          <Pressable key={r.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/record/[id]', params: { id: r.id } })} style={styles.card}>
            <View style={[styles.dot, { backgroundColor: EMOTIONS[r.emotion].color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.cardDate}>{dateText(r.date, false)} · {EMOTIONS[r.emotion].name}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  brand: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: 1 },
  hello: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14 },
  hero: { alignItems: 'center', marginVertical: 18 },
  section: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 28, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  dot: { width: 14, height: 14, borderRadius: 7 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardDate: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
});

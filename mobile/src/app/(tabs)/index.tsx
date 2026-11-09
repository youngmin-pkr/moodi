import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { RecordCard } from '../../components/RecordCard';
import { WeekStrip } from '../../components/WeekStrip';
import { colors } from '../../constants/theme';
import { dateText, today } from '../../lib/date';
import { sortRecords } from '../../lib/records';
import { useRecords } from '../../state/RecordsContext';

export default function Home() {
  const { records, ready } = useRecords();
  const latest = sortRecords(records)[0];
  const hasSample = records.some((r) => r.sample);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <View style={styles.brand}>
            <Mascot size={36} />
            <Text style={styles.brandText}>MOODI</Text>
          </View>
          <View style={styles.icons}>
            <Pressable accessibilityRole="button" accessibilityLabel="프로필" hitSlop={8} onPress={() => router.navigate('/profile')}>
              <Icon name="profile" color={colors.primary} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="기록 알림" hitSlop={8} onPress={() => router.navigate('/profile')}>
              <Icon name="bell" color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.date}>{dateText(today(), false)}</Text>
        <Text style={styles.h1}>오늘의 마음을{'\n'}가만히 펼쳐볼까요?</Text>

        <Pressable accessibilityRole="button" accessibilityLabel="오늘의 마음 기록하기" onPress={() => router.push('/emotion')} style={styles.hero}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <Text style={styles.heroSmall}>마음이 머무는 곳</Text>
          <Text style={styles.heroTitle}>어떤 마음이든{'\n'}여기서는 괜찮아요.</Text>
          <View style={styles.heroMascot}>
            <Mascot size={112} />
          </View>
          <View style={styles.heroCta}>
            <Icon name="edit" size={18} color="#fff" />
            <Text style={styles.heroCtaText}>오늘의 마음 기록하기</Text>
            <Icon name="next" size={16} color="#fff" />
          </View>
        </Pressable>

        <Text style={styles.h2}>이번 주의 마음</Text>
        <WeekStrip records={records} />

        <View style={styles.sectionRow}>
          <Text style={styles.h2}>최근 기록</Text>
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/records')} hitSlop={8}>
            <Text style={styles.more}>전체 보기 ›</Text>
          </Pressable>
        </View>
        {latest ? <RecordCard record={latest} featured /> : ready ? <EmptyState message={'아직 남겨진 마음이 없어요.\n오늘의 첫 마음을 기록해볼까요?'} /> : null}
        {hasSample && <Text style={styles.note}>미리 채워둔 예시 기록입니다 · 내 기록을 추가해보세요</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: 1.5 },
  icons: { flexDirection: 'row', gap: 18 },
  date: { fontSize: 14, color: colors.textSoft, marginTop: 14 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text, lineHeight: 36, marginTop: 6 },
  hero: { backgroundColor: colors.primary, borderRadius: 26, padding: 22, marginTop: 18, overflow: 'hidden', minHeight: 210 },
  blob1: { position: 'absolute', right: -40, top: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(255,255,255,0.10)' },
  blob2: { position: 'absolute', right: 30, bottom: -60, width: 190, height: 150, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroSmall: { fontSize: 12, color: '#efe8ff' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 31, marginTop: 10 },
  heroMascot: { position: 'absolute', right: 14, bottom: 42 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 46 },
  heroCtaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 26, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  more: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  note: { textAlign: 'center', fontSize: 12, color: colors.textSoft, marginTop: 4 },
});

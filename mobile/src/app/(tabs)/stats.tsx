import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, Donut } from '../../components/Charts';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { RecordCard, openRecord } from '../../components/RecordCard';
import { EMOTIONS } from '../../constants/emotions';
import { colors, titleFont } from '../../constants/theme';
import { monthDay, parseDate, shiftDate, shiftMonthClamped, today } from '../../lib/date';
import { emotionLabel, sortRecords } from '../../lib/records';
import { countByEmotion, countByMonth, distinctDays, monthForEmotion, ratios, recordsInPeriod, topEmotion, weekDays, withJosa } from '../../lib/stats';
import { useRecords } from '../../state/RecordsContext';
import { StatPeriod } from '../../types';

const PERIODS: { key: StatPeriod; label: string }[] = [
  { key: 'week', label: '주간' },
  { key: 'month', label: '월간' },
  { key: 'year', label: '연간' },
];
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

function periodLabel(period: StatPeriod, anchor: string): string {
  if (period === 'year') return `${anchor.slice(0, 4)}년`;
  if (period === 'month') return `${anchor.slice(0, 4)}년 ${Number(anchor.slice(5, 7))}월`;
  return `${monthDay(shiftDate(anchor, -6))} ~ ${monthDay(anchor)}`;
}

function move(period: StatPeriod, anchor: string, dir: 1 | -1): string {
  if (period === 'week') return shiftDate(anchor, 7 * dir);
  return shiftMonthClamped(anchor, (period === 'year' ? 12 : 1) * dir);
}

export default function Stats() {
  const { records } = useRecords();
  const [period, setPeriod] = useState<StatPeriod>('week');
  const [anchor, setAnchor] = useState(today());
  const navCount = useRef(0);

  const rs = useMemo(() => recordsInPeriod(records, period, anchor), [records, period, anchor]);
  const counts = useMemo(() => countByEmotion(rs), [rs]);
  const pct = useMemo(() => ratios(counts), [counts]);
  const top = topEmotion(counts);
  const total = rs.length;

  const bars =
    period === 'year'
      ? countByMonth(rs).map((count, i) => ({ label: String(i + 1), count, color: i % 3 ? '#cfc0ed' : '#b0a7db' }))
      : EMOTIONS.map((e, i) => ({ label: e.name, count: counts[i], color: e.color }));

  const subtitle = period === 'week' ? (distinctDays(rs) === 7 ? '7일 모두 마음을 기록했어요' : `7일 중 ${distinctDays(rs)}일 마음을 기록했어요`) : `${total}번의 마음을 기록했어요`;
  const bannerDetail =
    top === null
      ? '오늘의 첫 마음을 남겨보세요.'
      : period === 'week'
        ? `7일 중 ${counts[top]}일, ${withJosa(EMOTIONS[top].name, '을', '를')} 기록했어요.`
        : `${total}개의 기록 중 ${counts[top]}개가 ${withJosa(EMOTIONS[top].name, '이에요', '예요')}.`;

  const openEmotion = (emotion: number) =>
    router.navigate({ pathname: '/records', params: { month: monthForEmotion(records, period, anchor, emotion), emotion: String(emotion), t: String(++navCount.current) } });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>감정 통계</Text>

        <View style={styles.segment} accessibilityRole="tablist">
          {PERIODS.map((p) => (
            <Pressable key={p.key} accessibilityRole="tab" accessibilityState={{ selected: period === p.key }} onPress={() => setPeriod(p.key)} style={[styles.seg, period === p.key && styles.segOn]}>
              <Text style={[styles.segText, period === p.key && styles.segTextOn]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.nav}>
          <Pressable accessibilityRole="button" accessibilityLabel="이전 기간" onPress={() => setAnchor(move(period, anchor, -1))} style={styles.hit}>
            <Icon name="back" size={20} />
          </Pressable>
          <Text style={styles.navLabel}>{periodLabel(period, anchor)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="다음 기간" onPress={() => setAnchor(move(period, anchor, 1))} style={styles.hit}>
            <Icon name="next" size={20} />
          </Pressable>
        </View>
        <Text style={styles.sub}>{subtitle}</Text>

        <View style={styles.banner}>
          <Mascot emotion={top ?? undefined} size={84} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSmall}>가장 자주 찾아온 마음</Text>
            <Text style={styles.bannerTitle}>{top === null ? '아직 기록이 없어요' : EMOTIONS[top].name}</Text>
            <Text style={styles.bannerDetail}>{bannerDetail}</Text>
          </View>
        </View>

        {period === 'week' ? (
          <>
            <View style={styles.weekRow}>
              {weekDays(rs, anchor).map(({ date, record }) => (
                <Pressable
                  key={date}
                  accessibilityRole="button"
                  accessibilityLabel={record ? `${monthDay(date)} ${emotionLabel(record)}` : `${monthDay(date)} 기록 없음`}
                  disabled={!record}
                  onPress={() => record && openRecord(record.id)}
                  style={styles.weekDay}
                >
                  <Text style={styles.weekLabel}>{WEEKDAY[parseDate(date).getDay()]}</Text>
                  <Mascot emotion={record ? record.emotion : undefined} size={36} />
                  <Text style={[styles.weekEmotion, !record && { color: '#cfc7dd' }]} numberOfLines={1}>{record ? emotionLabel(record) : '-'}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sectionRow}>
              <Text style={styles.h2}>{anchor === today() ? '이번 주 기록' : '이 주의 기록'}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.navigate('/records')} style={styles.moreBtn}>
                <Text style={styles.more}>전체 보기 ›</Text>
              </Pressable>
            </View>
            {sortRecords(rs).slice(0, 3).map((r) => <RecordCard key={r.id} record={r} />)}
            {!total && <Text style={styles.empty}>이 기간에는 남긴 기록이 없어요.</Text>}
          </>
        ) : (
          <View style={{ marginTop: 26 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.h2}>감정의 흐름</Text>
              <Text style={styles.unit}>기록 수</Text>
            </View>
            <BarChart bars={bars} />
          </View>
        )}

        <Text style={[styles.h2, { marginTop: 30 }]}>감정 비율</Text>
        <Text style={styles.hint}>감정을 누르면 그날의 기록을 볼 수 있어요.</Text>
        <View style={styles.ratio}>
          <Donut total={total} slices={EMOTIONS.map((e, i) => ({ value: counts[i], color: e.color }))} />
          <View style={styles.legend}>
            {total ? (
              EMOTIONS.map((e, i) =>
                counts[i] ? (
                  <Pressable key={e.name} accessibilityRole="button" accessibilityLabel={`${e.name} ${pct[i]}퍼센트, 기록 보기`} onPress={() => openEmotion(i)} style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: e.color }]} />
                    <Text style={styles.legendName}>{e.name}</Text>
                    <Text style={styles.legendPct}>{pct[i]}%</Text>
                    <Icon name="next" size={14} color={colors.textSoft} />
                  </Pressable>
                ) : null,
              )
            ) : (
              <Text style={styles.hint}>기록을 남기면{'\n'}감정 비율이 나타나요.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { ...titleFont, textAlign: 'center', fontSize: 18, color: colors.text, marginTop: 16, marginBottom: 14 },
  segment: { flexDirection: 'row', backgroundColor: '#efe9fb', borderRadius: 16, padding: 4 },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 12 },
  segOn: { backgroundColor: '#fff' },
  segText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  segTextOn: { color: colors.text, fontWeight: '800' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  navLabel: { ...titleFont, fontSize: 20, color: colors.text },
  sub: { textAlign: 'center', fontSize: 13, color: colors.textSoft, marginTop: 6 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#e6dcf8', borderRadius: 22, padding: 16, marginTop: 16 },
  bannerSmall: { fontSize: 12, fontWeight: '700', color: colors.text },
  bannerTitle: { ...titleFont, fontSize: 24, color: colors.text, marginTop: 4 },
  bannerDetail: { fontSize: 12, color: colors.textSoft, marginTop: 4 },
  weekRow: { flexDirection: 'row', gap: 4, marginTop: 16 },
  weekDay: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  weekLabel: { fontSize: 12, color: colors.textSoft },
  weekEmotion: { fontSize: 11, fontWeight: '700', color: colors.text },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  h2: { ...titleFont, fontSize: 18, color: colors.text, marginTop: 24, marginBottom: 12 },
  more: { fontSize: 13, fontWeight: '700', color: colors.primary },
  moreBtn: { minHeight: 44, justifyContent: 'center', paddingLeft: 12, marginBottom: 2 },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  unit: { fontSize: 12, color: colors.textSoft, marginBottom: 12 },
  empty: { textAlign: 'center', fontSize: 13, color: colors.textSoft, marginTop: 8 },
  hint: { fontSize: 12, color: colors.textSoft, lineHeight: 18 },
  ratio: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 14 },
  legend: { flex: 1, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 14, color: colors.text },
  legendPct: { fontSize: 14, fontWeight: '800', color: colors.text },
});

import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { MonthPicker } from '../../components/MonthPicker';
import { RecordCard } from '../../components/RecordCard';
import { EMOTIONS } from '../../constants/emotions';
import { colors, titleFont } from '../../constants/theme';
import { shiftMonth, today } from '../../lib/date';
import { queryRecords } from '../../lib/records';
import { useRecords } from '../../state/RecordsContext';

export default function RecordsScreen() {
  // 통계 화면에서 감정을 눌러 넘어오면 그 달·그 감정으로 목록을 엽니다.
  // t가 바뀔 때마다 화면 상태를 새로 시작하므로, 같은 감정을 다시 눌러도 반응합니다.
  const params = useLocalSearchParams<{ month?: string; emotion?: string; t?: string }>();
  return <Records key={params.t ?? 'default'} initialMonth={params.month} initialEmotion={params.emotion} />;
}

function Records({ initialMonth, initialEmotion }: { initialMonth?: string; initialEmotion?: string }) {
  const { records } = useRecords();
  const [month, setMonth] = useState(() => (initialMonth && /^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : today().slice(0, 7)));
  const [emotion, setEmotion] = useState(() => {
    const e = Number(initialEmotion);
    return initialEmotion !== undefined && Number.isInteger(e) && e >= -1 && e < EMOTIONS.length ? e : -1;
  });
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [picker, setPicker] = useState(false);

  const list = useMemo(() => queryRecords(records, { month, emotion, search }), [records, month, emotion, search]);
  const [y, m] = month.split('-');
  const isThisMonth = month === today().slice(0, 7);
  const scope = emotion < 0 ? (isThisMonth ? '이번 달' : `${Number(m)}월`) : `${EMOTIONS[emotion].name}(으)로 채운 날`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <View>
            <Text style={styles.eyebrow}>마음을 모아보는 시간</Text>
            <Text style={styles.h1}>나의 기록</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="기록 검색"
            style={styles.hit}
            onPress={() => {
              if (searching) setSearch('');
              setSearching((v) => !v);
            }}
          >
            <Icon name={searching ? 'close' : 'search'} color={colors.text} />
          </Pressable>
        </View>

        {searching && (
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder="제목이나 내용 검색"
            placeholderTextColor="#b3abc4"
            accessibilityLabel="기록 검색어"
            returnKeyType="search"
            style={styles.search}
          />
        )}

        <View style={styles.period}>
          <Icon name="calendar" size={20} color={colors.primary} />
          <Pressable accessibilityRole="button" accessibilityLabel="월 선택" onPress={() => setPicker(true)} style={styles.periodLabel}>
            <Text style={styles.periodText}>{y}년 {Number(m)}월</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={() => setMonth(shiftMonth(month, -1))} style={styles.hit}>
            <Icon name="back" size={20} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="다음 달" onPress={() => setMonth(shiftMonth(month, 1))} style={styles.hit}>
            <Icon name="next" size={20} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {[{ i: -1, name: '전체' }, ...EMOTIONS.map((e, i) => ({ i, name: e.name }))].map(({ i, name }) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityState={{ selected: emotion === i }}
              onPress={() => setEmotion(i)}
              style={[styles.chip, emotion === i && styles.chipOn]}
            >
              <Text style={[styles.chipText, emotion === i && { color: '#fff' }]}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.count}>
          {scope} · {list.length}개의 마음을 남겼어요.
        </Text>

        {list.length ? (
          list.map((r) => <RecordCard key={r.id} record={r} />)
        ) : (
          <EmptyState
            action={!search && emotion < 0}
            message={search || emotion >= 0 ? '조건에 맞는 기록이 없어요.' : '이 달에는 아직 남겨진 마음이 없어요.\n오늘의 첫 마음을 기록해볼까요?'}
          />
        )}
        <Text style={styles.footnote}>작은 기록이 나를 알아가는 길이 돼요.</Text>
      </ScrollView>
      <MonthPicker
        visible={picker}
        value={month}
        onClose={() => setPicker(false)}
        onPick={(ym) => {
          setMonth(ym);
          setPicker(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: colors.primary },
  h1: { ...titleFont, fontSize: 28, color: colors.text, marginTop: 2 },
  search: { marginTop: 14, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  period: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, marginTop: 16, borderWidth: 1, borderColor: colors.border },
  periodLabel: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  periodText: { ...titleFont, fontSize: 17, color: colors.text },
  chips: { gap: 8, paddingVertical: 14 },
  chip: { paddingHorizontal: 16, minHeight: 44, justifyContent: 'center', borderRadius: 22, backgroundColor: '#efe9fb' },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.textSoft },
  count: { fontSize: 13, color: colors.textSoft, marginBottom: 12 },
  footnote: { textAlign: 'center', fontSize: 12, color: colors.textSoft, marginTop: 18 },
});

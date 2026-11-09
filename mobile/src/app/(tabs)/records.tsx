import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { MonthPicker } from '../../components/MonthPicker';
import { RecordCard } from '../../components/RecordCard';
import { EMOTIONS } from '../../constants/emotions';
import { colors } from '../../constants/theme';
import { shiftMonth, today } from '../../lib/date';
import { queryRecords } from '../../lib/records';
import { useRecords } from '../../state/RecordsContext';

export default function Records() {
  const { records } = useRecords();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [emotion, setEmotion] = useState(-1);
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
            hitSlop={10}
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
          <Pressable accessibilityRole="button" accessibilityLabel="이전 달" hitSlop={10} onPress={() => setMonth(shiftMonth(month, -1))}>
            <Icon name="back" size={20} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="다음 달" hitSlop={10} onPress={() => setMonth(shiftMonth(month, 1))} style={{ marginLeft: 14 }}>
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
  h1: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 2 },
  search: { marginTop: 14, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  period: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, marginTop: 16, borderWidth: 1, borderColor: colors.border },
  periodLabel: { flex: 1, alignItems: 'center' },
  periodText: { fontSize: 17, fontWeight: '800', color: colors.text },
  chips: { gap: 8, paddingVertical: 14 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: '#efe9fb' },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.textSoft },
  count: { fontSize: 13, color: colors.textSoft, marginBottom: 12 },
  footnote: { textAlign: 'center', fontSize: 12, color: colors.textSoft, marginTop: 18 },
});

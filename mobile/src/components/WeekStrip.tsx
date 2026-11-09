import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Mascot } from './Mascot';
import { openRecord } from './RecordCard';
import { colors } from '../constants/theme';
import { dateText, parseDate, shiftDate, today } from '../lib/date';
import { sortRecords } from '../lib/records';
import { DiaryRecord } from '../types';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** 기준일이 속한 주(월~일)의 시작일 */
export function weekStart(date: string): string {
  const day = parseDate(date).getDay() || 7; // 일요일을 7로
  return shiftDate(date, 1 - day);
}

function EmptyCloud() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M11 32C3 32 2 25 6 21 2 13 8 7 14 9 18 2 25 4 27 10 35 8 38 16 34 21 40 28 33 35 28 32 23 38 15 37 11 32Z" fill="none" stroke="#d8cfe3" strokeDasharray="2 2" strokeWidth={1.5} />
    </Svg>
  );
}

export function WeekStrip({ records }: { records: readonly DiaryRecord[] }) {
  const now = today();
  const monday = weekStart(now);
  const sorted = sortRecords(records);
  return (
    <View style={styles.row}>
      {DAYS.map((label, i) => {
        const date = shiftDate(monday, i);
        const rec = sorted.find((r) => r.date === date);
        const isToday = date === now;
        return (
          <View key={date} style={styles.day}>
            <Text style={[styles.label, isToday && styles.labelToday]}>{label}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${dateText(date)} ${rec ? '기록 보기' : '기록하기'}`}
              onPress={() => (rec ? openRecord(rec.id) : router.push({ pathname: '/emotion', params: { date } }))}
              style={[styles.cloud, isToday && styles.cloudToday]}
            >
              {rec ? <Mascot emotion={rec.emotion} size={38} /> : <EmptyCloud />}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6, flex: 1 },
  label: { fontSize: 13, color: colors.textSoft },
  labelToday: { color: colors.text, fontWeight: '800' },
  cloud: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  cloudToday: { borderColor: colors.primary, backgroundColor: '#fff' },
});

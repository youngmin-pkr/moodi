import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Backdrop } from './Sheets';
import { Icon } from './Icon';
import { colors, titleFont } from '../constants/theme';

/** 'YYYY-MM' 값을 고르는 연·월 선택 창 */
export function MonthPicker({ visible, value, onPick, onClose }: { visible: boolean; value: string; onPick: (ym: string) => void; onClose: () => void }) {
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const selYear = Number(value.slice(0, 4));
  const selMonth = Number(value.slice(5, 7));
  return (
    <Backdrop visible={visible} onClose={onClose} center>
      <View style={styles.yearRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="이전 해" onPress={() => setYear((y) => y - 1)} hitSlop={10}>
          <Icon name="back" />
        </Pressable>
        <Text style={styles.year}>{year}년</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="다음 해" onPress={() => setYear((y) => y + 1)} hitSlop={10}>
          <Icon name="next" />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const on = year === selYear && m === selMonth;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => onPick(`${year}-${String(m).padStart(2, '0')}`)}
              style={[styles.cell, on && styles.cellOn]}
            >
              <Text style={[styles.cellText, on && { color: '#fff' }]}>{m}월</Text>
            </Pressable>
          );
        })}
      </View>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 8 },
  year: { ...titleFont, fontSize: 18, color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '23%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#f4effb', alignItems: 'center' },
  cellOn: { backgroundColor: colors.primary },
  cellText: { fontSize: 14, fontWeight: '700', color: colors.text },
});

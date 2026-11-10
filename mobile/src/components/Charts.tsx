import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

export type Bar = { label: string; count: number; color: string };

/** 막대그래프. 막대 위에 개수, 아래에 이름을 보여줍니다. */
export function BarChart({ bars, height = 110 }: { bars: readonly Bar[]; height?: number }) {
  const peak = Math.max(1, ...bars.map((b) => b.count));
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={bars.map((b) => `${b.label} ${b.count}개`).join(', ')}
      style={[styles.chart, { height: height + 46 }]}
    >
      {bars.map((b) => (
        <View key={b.label} style={styles.col}>
          <Text style={styles.count}>{b.count}</Text>
          <View style={{ height: height, justifyContent: 'flex-end' }}>
            <View style={{ width: 16, height: Math.max(b.count ? 6 : 3, (b.count / peak) * height), borderRadius: 8, backgroundColor: b.count ? b.color : '#e6dff2' }} />
          </View>
          <Text style={styles.label} numberOfLines={1}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

export type Slice = { value: number; color: string };

/** 원그래프(도넛). 가운데에는 총 개수를 보여줍니다. */
export function Donut({ slices, total, size = 132, stroke = 22 }: { slices: readonly Slice[]; total: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#e9e0f5" strokeWidth={stroke} fill="none" />
        {total > 0 &&
          slices.map((s, i) => {
            if (!s.value) return null;
            const len = (s.value / total) * c;
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
            offset += len;
            return el;
          })}
      </Svg>
      <Text style={styles.donutNum}>{total}</Text>
      <Text style={styles.donutSub}>개의 마음</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  count: { fontSize: 12, color: colors.textSoft },
  label: { fontSize: 11, color: colors.textSoft },
  donutNum: { fontSize: 26, fontWeight: '900', color: colors.text },
  donutSub: { fontSize: 11, color: colors.textSoft },
});

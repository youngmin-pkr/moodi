import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../components/Text';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { AnimatedMascot } from '../components/AnimatedMascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { EMOTIONS, OTHER_EMOTION } from '../constants/emotions';
import { colors, titleFont } from '../constants/theme';

export default function EmotionScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [selected, setSelected] = useState<number | null>(null);
  // 누를 때마다 올라가서, 이미 선택된 구름을 다시 눌러도 반응합니다.
  const [taps, setTaps] = useState(0);
  // 좌우 여백 24px, 칸 사이 12px 기준으로 3열 너비를 계산합니다. (퍼센트는 반올림 오차로 줄바꿈이 깨질 수 있음)
  const { width } = useWindowDimensions();
  const cellWidth = Math.floor((Math.min(width, 520) - 48 - 24) / 3);

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>오늘은 어떤 기분인가요~?</Text>
        <Text style={styles.sub}>가장 가까운 감정을 선택해보세요.</Text>
        <View style={styles.grid}>
          {EMOTIONS.map((e, i) => {
            const on = selected === i;
            return (
              <Pressable
                key={e.name}
                accessibilityRole="button"
                accessibilityLabel={e.name}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  setSelected(i);
                  setTaps((n) => n + 1);
                }}
                style={[styles.cell, { width: cellWidth, backgroundColor: e.soft }, on && { borderColor: colors.primary, backgroundColor: '#fff' }]}
              >
                {/* 선택된 구름만 움직입니다. 9개가 모두 움직이면 산만하고 배터리도 더 씁니다. */}
                <AnimatedMascot emotion={i} size={72} idle={on} halo={on} sparkles={on} reactKey={on ? taps : 0} />
                <Text style={[styles.name, on && { color: colors.primary }]}>{e.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="다음"
          disabled={selected === null}
          onPress={() => router.push({ pathname: '/write', params: { emotion: String(selected), ...(date ? { date } : {}) } })}
        />
        {selected === null && <Text style={styles.hint}>감정을 선택하면 다음으로 넘어갈 수 있어요.</Text>}
        {selected === OTHER_EMOTION && <Text style={styles.hint}>다음 화면에서 감정 이름을 직접 적을 수 있어요.</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { ...titleFont, fontSize: 24, color: colors.text, marginTop: 8 },
  sub: { fontSize: 15, color: colors.textSoft, marginTop: 6, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { aspectRatio: 0.9, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  name: { marginTop: 4, fontSize: 15, fontWeight: '700', color: colors.text },
  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  hint: { textAlign: 'center', marginTop: 8, fontSize: 12, color: colors.textSoft },
});

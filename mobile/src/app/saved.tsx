import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../constants/theme';
import { useRecords } from '../state/RecordsContext';

export default function SavedScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { records } = useRecords();
  const rec = records.find((r) => r.id === id);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Mascot emotion={rec?.emotion ?? 8} size={150} />
        <Text style={styles.title}>기록이 저장되었어요!</Text>
        <Text style={styles.msg}>오늘의 감정이{'\n'}소중히 기록 되었어요!</Text>
        <Text style={styles.thanks}>좋은 하루를 만들어주셔서 감사해요!</Text>
      </View>
      <View style={styles.footer}>
        {rec && <PrimaryButton label="기록 보기" onPress={() => router.replace({ pathname: '/record/[id]', params: { id: rec.id } })} />}
        <PrimaryButton label="홈으로 돌아가기" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 16 },
  msg: { fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 24, marginTop: 10 },
  thanks: { fontSize: 13, color: colors.textSoft, marginTop: 14 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 10 },
});

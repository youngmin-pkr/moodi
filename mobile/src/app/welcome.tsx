import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '../components/Form';
import { GradientBackground } from '../components/GradientBackground';
import { Mascot } from '../components/Mascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/Toast';
import { colors } from '../constants/theme';

export default function Welcome() {
  const toast = useToast();
  return (
    <SafeAreaView style={styles.safe}>
      <GradientBackground />
      <View style={styles.top}>
        <Text style={styles.eyebrow}>오늘의 마음이 머무는 구름,</Text>
        <Wordmark size={46} />
        <Text style={styles.kor}>무디</Text>
      </View>

      <View style={styles.hero}>
        <Text style={[styles.spark, { left: 56, top: 20 }]}>✦</Text>
        <Text style={[styles.spark, { right: 60, top: 0, fontSize: 18 }]}>✦</Text>
        <Text style={[styles.spark, { right: 70, bottom: 14, fontSize: 16 }]}>✦</Text>
        <Mascot size={190} />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label="카카오로 계속하기" onPress={() => toast('카카오 로그인은 아직 연결되지 않았어요.')} />
        <PrimaryButton label="Apple로 계속하기" variant="secondary" onPress={() => toast('Apple 로그인은 아직 연결되지 않았어요.')} />
        <View style={styles.links}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={styles.linkBtn}>
            <Text style={styles.link}>이메일 로그인</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/signup')} style={styles.linkBtn}>
            <Text style={styles.link}>회원가입</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.guest}>
          <Text style={styles.guestText}>로그인 없이 체험하기</Text>
        </Pressable>
        <Text style={styles.note}>현재는 기기에 기록을 저장하는 체험 버전이에요.{'\n'}계속하면 이용약관 및 개인정보 처리방침에 동의해요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5effd', paddingHorizontal: 24 },
  top: { alignItems: 'center', marginTop: 44, gap: 8 },
  eyebrow: { fontSize: 15, fontWeight: '800', color: colors.primary },
  kor: { fontSize: 13, color: colors.textSoft },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute', fontSize: 24, color: '#b69bdf' },
  bottom: { gap: 10, paddingBottom: 12 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 2 },
  linkBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  link: { fontSize: 14, fontWeight: '800', color: colors.textSoft },
  dot: { color: colors.textSoft },
  guest: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  guestText: { fontSize: 14, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' },
  note: { textAlign: 'center', fontSize: 11, lineHeight: 17, color: colors.textSoft, marginTop: 4 },
});

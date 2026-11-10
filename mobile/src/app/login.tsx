import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, Wordmark } from '../components/Form';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/Toast';
import { colors } from '../constants/theme';
import { emailError, passwordError } from '../lib/validation';

// 체험 버전: 입력값은 검사만 하고 저장하거나 어디로도 보내지 않습니다.
export default function Login() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const eErr = tried ? emailError(email) : null;
  const pErr = tried ? passwordError(password) : null;

  const submit = () => {
    setTried(true);
    if (emailError(email) || passwordError(password)) return;
    toast('체험 버전이라 실제 로그인은 연결되어 있지 않아요. 체험 모드로 들어갈게요.');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="로그인" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Wordmark /></View>
          <Field label="이메일" value={email} onChangeText={setEmail} error={eErr} placeholder="이메일 주소를 입력해주세요" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <Field label="비밀번호" value={password} onChangeText={setPassword} error={pErr} placeholder="8자 이상 입력해주세요" secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
          <Pressable accessibilityRole="button" onPress={() => toast('비밀번호 찾기는 아직 준비 중이에요.')} style={styles.forgot}>
            <Text style={styles.forgotText}>비밀번호 찾기</Text>
          </Pressable>
          <Text style={styles.note}>실제 인증 서버가 연결되지 않았어요.{'\n'}입력한 이메일과 비밀번호는 저장되거나 전송되지 않아요.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/signup')} style={styles.switch}>
            <Text style={styles.switchText}>처음 오셨나요? 회원가입</Text>
          </Pressable>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="로그인" onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  logo: { marginVertical: 28 },
  forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' },
  forgotText: { fontSize: 13, color: colors.textSoft },
  note: { textAlign: 'center', fontSize: 12, lineHeight: 18, color: colors.textSoft, marginTop: 30 },
  switch: { alignItems: 'center', justifyContent: 'center', marginTop: 20, minHeight: 44 },
  switchText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
});

import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/Text';
import { router } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckRow, Field, Wordmark } from '../components/Form';
import { Header } from '../components/Header';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/Toast';
import { colors } from '../constants/theme';
import { emailError, MAX_NICKNAME_LENGTH, nicknameError, passwordError } from '../lib/validation';
import { useRecords } from '../state/RecordsContext';

// 체험 버전: 닉네임만 이 기기의 프로필에 저장합니다. 이메일과 비밀번호는 저장하거나 보내지 않습니다.
export default function Signup() {
  const toast = useToast();
  const { updateProfile } = useRecords();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const nErr = tried ? nicknameError(nickname) : null;
  const eErr = tried ? emailError(email) : null;
  const pErr = tried ? passwordError(password) : null;

  const submit = async () => {
    setTried(true);
    if (nicknameError(nickname) || emailError(email) || passwordError(password) || !agree) return;
    const name = nickname.trim();
    await updateProfile({ name });
    toast(`${name}님, 환영해요! 체험 모드로 시작해요.`);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="회원가입" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}><Wordmark /></View>
          <Field label="닉네임" value={nickname} onChangeText={setNickname} error={nErr} maxLength={MAX_NICKNAME_LENGTH} placeholder="어떻게 불러드릴까요?" autoComplete="nickname" />
          <Field label="이메일" value={email} onChangeText={setEmail} error={eErr} placeholder="이메일 주소를 입력해주세요" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <Field label="비밀번호" value={password} onChangeText={setPassword} error={pErr} placeholder="8자 이상 입력해주세요" secureTextEntry autoComplete="new-password" textContentType="newPassword" />
          <CheckRow checked={agree} onChange={setAgree} error={tried} label="이용약관 및 개인정보 처리방침 동의" />
          <Text style={styles.note}>실제 계정은 만들어지지 않아요.{'\n'}닉네임만 이 기기에 저장되고, 이메일과 비밀번호는 저장되거나 전송되지 않아요.</Text>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="시작하기" onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  logo: { marginVertical: 24 },
  note: { textAlign: 'center', fontSize: 12, lineHeight: 18, color: colors.textSoft, marginTop: 26 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
});

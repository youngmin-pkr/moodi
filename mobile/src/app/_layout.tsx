import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Jua_400Regular } from '@expo-google-fonts/jua';
import { Syncopate_700Bold } from '@expo-google-fonts/syncopate';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { RecordsProvider, useRecords } from '../state/RecordsContext';
import { ToastProvider } from '../components/Toast';
import { restoreReminder, setupNotificationHandler } from '../lib/reminder';

setupNotificationHandler();
// 저장된 기록을 다 읽기 전에는 시작 화면을 유지해, 빈 화면이 잠깐 보이는 것을 막습니다.
SplashScreen.preventAutoHideAsync().catch(() => {});

function HideSplashWhenReady({ fontsReady }: { fontsReady: boolean }) {
  const { ready, profile } = useRecords();
  // 기록과 글꼴이 모두 준비되면 시작 화면을 걷습니다. (글꼴이 바뀌며 깜빡이는 것을 막습니다)
  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsReady]);
  // 저장된 알림 시간으로 예약을 맞춰 둡니다. (예약이 실패했던 경우나 백업 복원 뒤를 위해)
  const reminder = profile.reminder;
  useEffect(() => {
    if (ready) void restoreReminder(reminder);
  }, [ready, reminder]);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Jua_400Regular, Syncopate_700Bold });
  // 글꼴을 못 불러와도 앱은 기본 글꼴로 계속 쓸 수 있어야 합니다.
  const fontsReady = fontsLoaded || fontError !== null;
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <RecordsProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <HideSplashWhenReady fontsReady={fontsReady} />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
          </ToastProvider>
        </RecordsProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

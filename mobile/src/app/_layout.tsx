import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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

function HideSplashWhenReady() {
  const { ready, profile } = useRecords();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  // 저장된 알림 시간으로 예약을 맞춰 둡니다. (예약이 실패했던 경우나 백업 복원 뒤를 위해)
  const reminder = profile.reminder;
  useEffect(() => {
    if (ready) void restoreReminder(reminder);
  }, [ready, reminder]);
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <RecordsProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <HideSplashWhenReady />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
          </ToastProvider>
        </RecordsProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

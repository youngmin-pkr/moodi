import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { RecordsProvider } from '../state/RecordsContext';
import { ToastProvider } from '../components/Toast';
import { setupNotificationHandler } from '../lib/reminder';

setupNotificationHandler();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RecordsProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        </ToastProvider>
      </RecordsProvider>
    </SafeAreaProvider>
  );
}

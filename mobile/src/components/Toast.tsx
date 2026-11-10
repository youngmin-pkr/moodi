import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const insets = useSafeAreaInsets();
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    // 긴 안내는 읽을 시간이 더 필요합니다.
    timer.current = setTimeout(() => setMsg(null), Math.min(7000, 2800 + Math.max(0, m.length - 24) * 70));
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg !== null && (
        <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 90 }]}>
          <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={styles.text}>{msg}</Text>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  toast: { backgroundColor: '#3f3556', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18 },
  text: { color: '#fff', fontSize: 14, textAlign: 'center' },
});

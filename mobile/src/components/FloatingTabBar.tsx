import { useEffect, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { BlurView } from 'expo-blur';
import { router, type Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import { Icon, type IconName } from './Icon';
import { colors } from '../constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export const TAB_BAR_HEIGHT = 66;
const SIDE_MARGIN = 16;

/** 바가 화면 아래에서 떨어지는 거리. 홈 인디케이터가 있는 기기에서는 그 위쪽 가까이에 둡니다. */
const bottomOffset = (insetBottom: number) => Math.max(insetBottom - 6, 12);

/** 탭 화면의 스크롤 영역 아래 여백. 떠 있는 탭 바에 마지막 내용이 가려지지 않게 합니다. */
export function useTabBarPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return bottomOffset(bottom) + TAB_BAR_HEIGHT + 20;
}

const ICONS: Record<string, IconName> = { index: 'home', records: 'record', stats: 'stats', profile: 'profile' };

/**
 * 떠 있는 반투명 알약 모양 탭 바. 선택 표시가 탭 사이를 미끄러져 움직이고,
 * 가운데 + 버튼은 탭이 아니라 새 기록(감정 선택)을 엽니다.
 */
export function FloatingTabBar({ state, descriptors, emitter, navigateToTab, insets }: TabBarProps) {
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const slot = width / count;
  // 애니메이션 값은 한 번만 만들어 계속 같은 것을 씁니다.
  const [x] = useState(() => new Animated.Value(0));
  const [scales] = useState(() => state.routes.map(() => new Animated.Value(1)));
  const didLayout = useRef(false);

  // 선택이 바뀌면 표시를 미끄러뜨리고, 새로 선택된 아이콘을 통통 튀게 합니다.
  useEffect(() => {
    if (!slot) return;
    if (!didLayout.current) {
      didLayout.current = true;
      x.setValue(state.index * slot);
      return;
    }
    Animated.spring(x, { toValue: state.index * slot, damping: 16, stiffness: 190, mass: 0.9, useNativeDriver: true }).start();
    const s = scales[state.index];
    if (s) {
      s.setValue(0.82);
      Animated.spring(s, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    }
  }, [state.index, slot, x, scales]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View pointerEvents="box-none" style={[styles.outer, { left: SIDE_MARGIN, right: SIDE_MARGIN, bottom: bottomOffset(insets.bottom) }]}>
      <View style={styles.shadow}>
        <View style={styles.pill} onLayout={onLayout} accessibilityRole="tablist">
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
          {/* 블러가 약한 기기(안드로이드 등)에서도 글자가 잘 보이도록 얇은 흰 막을 한 겹 더합니다. */}
          <View style={[StyleSheet.absoluteFill, styles.veil]} />

          {slot > 0 && (
            <Animated.View style={[styles.highlight, { width: slot - 10, transform: [{ translateX: x }] }]} />
          )}

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              if (route.name === 'new') {
                return (
                  <View key={route.key} style={styles.slot}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="새 기록"
                      onPress={() => router.push('/emotion')}
                      style={({ pressed }) => [styles.plus, pressed && { transform: [{ scale: 0.94 }] }]}
                    >
                      <Icon name="plus" size={26} color="#fff" />
                    </Pressable>
                  </View>
                );
              }
              const title = descriptors[route.key]?.options.title ?? route.name;
              const color = focused ? colors.primary : colors.textSoft;
              const onPress = () => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              };
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityLabel={title}
                  accessibilityState={{ selected: focused }}
                  onPress={onPress}
                  style={styles.slot}
                >
                  <Animated.View style={{ alignItems: 'center', transform: [{ scale: scales[index] ?? 1 }] }}>
                    <Icon name={ICONS[route.name] ?? 'home'} size={22} color={color} active={focused} />
                    <Text style={[styles.label, { color }, focused && styles.labelOn]}>{title}</Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'absolute' },
  // 그림자는 overflow: hidden 안에서는 잘리므로 바깥 View에 줍니다.
  shadow: { borderRadius: TAB_BAR_HEIGHT / 2, shadowColor: '#3d2a85', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10, backgroundColor: 'rgba(255,255,255,0.01)' },
  pill: { height: TAB_BAR_HEIGHT, borderRadius: TAB_BAR_HEIGHT / 2, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  veil: { backgroundColor: 'rgba(255,255,255,0.58)' },
  highlight: { position: 'absolute', top: 7, left: 5, height: TAB_BAR_HEIGHT - 16, borderRadius: (TAB_BAR_HEIGHT - 16) / 2, backgroundColor: 'rgba(124,97,206,0.15)' },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  slot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  labelOn: { fontWeight: '800' },
  plus: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
});

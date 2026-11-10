import { Pressable, StyleSheet, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { Icon, IconName } from '../../components/Icon';
import { colors } from '../../constants/theme';

const tabIcon = (name: IconName) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return (
      <View style={[styles.iconPill, focused && styles.iconPillOn]}>
        <Icon name={name} size={22} active={focused} color={focused ? colors.primary : colors.textSoft} />
      </View>
    );
  };

function PlusButton() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="새 기록" onPress={() => router.push('/emotion')} style={styles.plusWrap}>
      <View style={styles.plus}>
        <Icon name="plus" size={28} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 68, paddingTop: 6 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="records" options={{ title: '기록', tabBarIcon: tabIcon('record') }} />
      <Tabs.Screen name="new" options={{ title: '새 기록', tabBarButton: () => <PlusButton /> }} />
      <Tabs.Screen name="stats" options={{ title: '통계', tabBarIcon: tabIcon('stats') }} />
      <Tabs.Screen name="profile" options={{ title: '프로필', tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: { width: 54, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconPillOn: { backgroundColor: '#ece5fb' },
  plusWrap: { flex: 1, alignItems: 'center' },
  plus: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: -16, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
});

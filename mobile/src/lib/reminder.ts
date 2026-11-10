import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { parseTime } from './time';

const CHANNEL_ID = 'moodi-reminder';

export type ReminderResult = { ok: true } | { ok: false; reason: 'denied' | 'unsupported' | 'error' };

/** 앱이 켜져 있을 때도 알림 배너가 보이도록 합니다. 앱 시작 시 한 번 호출합니다. */
export function setupNotificationHandler(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/**
 * 매일 정해진 시간에 울리는 로컬 알림을 예약합니다. time이 null이면 예약을 모두 지웁니다.
 * 권한이 없으면 요청하고, 거절되면 예약하지 않습니다.
 */
export async function applyReminder(time: string | null): Promise<ReminderResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unsupported' };
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const t = parseTime(time);
    if (!t) return { ok: true };

    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: 'denied' };

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: '기록 알림',
        // expo-notifications가 `export *`로 내보내는 enum이라 import/namespace 규칙이 찾지 못합니다(오탐).
        // eslint-disable-next-line import/namespace
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'MOODI', body: '오늘의 마음을 기록해볼까요?' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute, channelId: CHANNEL_ID },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

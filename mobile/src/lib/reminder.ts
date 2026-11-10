import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { parseTime } from './time';

const CHANNEL_ID = 'moodi-reminder';
const BODY = '오늘의 마음을 기록해볼까요?';

export type ReminderResult = { ok: true } | { ok: false; reason: 'denied' | 'unsupported' | 'error'; detail?: string };

/** 앱이 켜져 있을 때도 알림 배너가 보이도록 합니다. 앱 시작 시 한 번 호출합니다. */
export function setupNotificationHandler(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/** 어느 단계에서 실패했는지 알 수 있도록 오류 메시지에 단계 이름을 붙입니다. */
async function step<T>(name: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    console.warn(`[reminder] ${name} 실패`, e);
    throw new Error(`${name}: ${(e instanceof Error ? e.message : String(e)).slice(0, 80)}`);
  }
}

async function ensurePermission(): Promise<boolean> {
  let perm = await step('권한 확인', () => Notifications.getPermissionsAsync());
  if (!perm.granted) perm = await step('권한 요청', () => Notifications.requestPermissionsAsync());
  return perm.granted;
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await step('알림 채널', () =>
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '기록 알림',
      // expo-notifications가 `export *`로 내보내는 enum이라 import/namespace 규칙이 찾지 못합니다(오탐).
      // eslint-disable-next-line import/namespace
      importance: Notifications.AndroidImportance.DEFAULT,
    }),
  );
}

const fail = (e: unknown): ReminderResult => ({ ok: false, reason: 'error', detail: e instanceof Error ? e.message : String(e) });

/**
 * 매일 정해진 시간에 울리는 로컬 알림을 예약합니다. time이 null이면 예약을 모두 지웁니다.
 * 권한이 없으면 요청하고, 거절되면 예약하지 않습니다.
 */
export async function applyReminder(time: string | null): Promise<ReminderResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unsupported' };
  try {
    await step('기존 알림 지우기', () => Notifications.cancelAllScheduledNotificationsAsync());
    const t = parseTime(time);
    if (!t) return { ok: true };
    if (!(await ensurePermission())) return { ok: false, reason: 'denied' };
    await ensureChannel();
    await step('알림 예약', () =>
      Notifications.scheduleNotificationAsync({
        content: { title: 'MOODI', body: BODY },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute, channelId: CHANNEL_ID },
      }),
    );
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** 설정과 상관없이 5초 뒤에 알림 한 번을 보내, 알림이 이 기기에서 동작하는지 바로 확인합니다. */
export async function sendTestNotification(): Promise<ReminderResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unsupported' };
  try {
    if (!(await ensurePermission())) return { ok: false, reason: 'denied' };
    await ensureChannel();
    await step('테스트 알림 예약', () =>
      Notifications.scheduleNotificationAsync({
        content: { title: 'MOODI', body: `테스트 알림이에요. ${BODY}` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL_ID },
      }),
    );
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * 앱을 켤 때 저장된 알림 시간대로 예약을 맞춰 둡니다. (예약이 실패했던 경우나 백업 복원 뒤를 위해)
 * 권한을 새로 묻지는 않고, 이미 허용된 경우에만 예약합니다.
 */
export async function restoreReminder(time: string | null): Promise<void> {
  if (Platform.OS === 'web') return;
  const t = parseTime(time);
  if (!t) return;
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: { title: 'MOODI', body: BODY },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute, channelId: CHANNEL_ID },
    });
  } catch (e) {
    console.warn('[reminder] 복원 실패', e);
  }
}

export function reminderErrorText(res: Extract<ReminderResult, { ok: false }>): string {
  if (res.reason === 'denied') return '알림 권한이 꺼져 있어요. 휴대폰 설정에서 허용해주세요.';
  if (res.reason === 'unsupported') return '이 환경에서는 알림을 쓸 수 없어요. 휴대폰 앱에서 설정해주세요.';
  return `알림을 예약하지 못했어요. (${res.detail ?? '알 수 없는 오류'})`;
}

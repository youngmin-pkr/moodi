import { ReminderSheet } from './ProfileSheets';
import { useToast } from './Toast';
import { applyReminder, reminderErrorText, sendTestNotification } from '../lib/reminder';
import { koreanTime } from '../lib/time';
import { useRecords } from '../state/RecordsContext';

/** 기록 알림 설정 팝업. 홈의 종 아이콘과 프로필의 "기록 알림"에서 같이 씁니다. */
export function ReminderSheetHost({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { profile, updateProfile } = useRecords();
  const toast = useToast();

  const save = async (time: string | null) => {
    onClose();
    // 고른 시간은 알림 예약이 실패해도 먼저 저장합니다. (예약은 앱을 켤 때 다시 시도합니다)
    if (!(await updateProfile({ reminder: time }))) return toast('저장하지 못했어요. 다시 시도해주세요.');
    const res = await applyReminder(time);
    if (res.ok) toast(time ? `매일 ${koreanTime(time)}에 알려드릴게요` : '기록 알림을 껐어요');
    else toast(`시간은 저장했어요. ${reminderErrorText(res)}`);
  };

  const test = async () => {
    onClose();
    const res = await sendTestNotification();
    toast(res.ok ? '5초 뒤에 테스트 알림이 와요. 앱을 닫아도 돼요.' : reminderErrorText(res));
  };

  return <ReminderSheet visible={visible} value={profile.reminder} onSave={save} onTest={test} onClose={onClose} />;
}

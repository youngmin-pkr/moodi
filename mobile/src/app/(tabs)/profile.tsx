import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { NameSheet, ReminderSheet } from '../../components/ProfileSheets';
import { ConfirmDialog } from '../../components/Sheets';
import { useToast } from '../../components/Toast';
import { colors } from '../../constants/theme';
import { BackupError, mergeRecords } from '../../lib/backup';
import { exportBackup, materializePhotos, pickBackup, PickedBackup } from '../../lib/backupIO';
import { deletePhotos } from '../../lib/photos';
import { applyReminder } from '../../lib/reminder';
import { koreanTime } from '../../lib/time';
import { useRecords } from '../../state/RecordsContext';

function Row({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={value ? `${label} ${value}` : label} onPress={onPress} style={styles.row}>
      <Icon name={icon} size={22} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Icon name="next" size={16} color={colors.textSoft} />
    </Pressable>
  );
}

export default function Profile() {
  const { records, profile, updateProfile, replaceRecords } = useRecords();
  const toast = useToast();
  const [nameSheet, setNameSheet] = useState(false);
  const [reminderSheet, setReminderSheet] = useState(false);
  const [pending, setPending] = useState<PickedBackup | null>(null);
  const [clearSamples, setClearSamples] = useState(false);
  const [busy, setBusy] = useState(false);
  const sampleCount = records.filter((r) => r.sample).length;

  const saveName = async (name: string) => {
    setNameSheet(false);
    toast((await updateProfile({ name })) ? '프로필을 저장했어요' : '저장하지 못했어요. 다시 시도해주세요.');
  };

  const saveReminder = async (time: string | null) => {
    setReminderSheet(false);
    const res = await applyReminder(time);
    if (!res.ok) {
      if (res.reason === 'denied') return toast('알림 권한이 꺼져 있어요. 휴대폰 설정에서 허용해주세요.');
      if (res.reason === 'unsupported') return toast('이 환경에서는 알림을 쓸 수 없어요. 휴대폰 앱에서 설정해주세요.');
      return toast('알림을 설정하지 못했어요. 다시 시도해주세요.');
    }
    if (await updateProfile({ reminder: time })) toast(time ? `매일 ${koreanTime(time)}에 알려드릴게요` : '기록 알림을 껐어요');
  };

  const doExport = async () => {
    if (busy) return;
    setBusy(true);
    const res = await exportBackup(records, profile);
    setBusy(false);
    if (res === 'unavailable') toast('이 기기에서는 파일 공유를 사용할 수 없어요.');
    else if (res === 'error') toast('백업 파일을 만들지 못했어요. 다시 시도해주세요.');
  };

  const doPick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const picked = await pickBackup();
      if (!picked) return;
      if (!picked.records.length) return toast('불러올 기록이 없어요.');
      setPending(picked);
    } catch (e) {
      toast(e instanceof BackupError ? e.message : '백업 파일을 불러오지 못했어요.');
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async () => {
    const picked = pending;
    setPending(null);
    if (!picked) return;
    const restored = materializePhotos(picked.records);
    const merged = mergeRecords(records, restored);
    if (!(await replaceRecords(merged))) {
      deletePhotos(restored.flatMap((r) => r.photos));
      return toast('저장 공간이 부족해서 복원하지 못했어요.');
    }
    // 같은 id로 덮어쓴 기존 기록의 사진 파일은 정리합니다.
    const ids = new Set(restored.map((r) => r.id));
    deletePhotos(records.filter((r) => ids.has(r.id)).flatMap((r) => r.photos));
    if (picked.profile) await updateProfile({ name: picked.profile.name });
    toast(`${restored.length}개의 기록을 복원했어요${picked.skipped ? ` (읽지 못한 ${picked.skipped}개 제외)` : ''}`);
  };

  const doClearSamples = async () => {
    setClearSamples(false);
    if (await replaceRecords(records.filter((r) => !r.sample))) toast('예시 기록을 지웠어요');
    else toast('지우지 못했어요. 다시 시도해주세요.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>프로필</Text>

        <View style={styles.card}>
          <Mascot emotion={8} size={92} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}님</Text>
            <Text style={styles.tagline}>오늘도 나를 알아가는 중</Text>
            <Pressable accessibilityRole="button" onPress={() => setNameSheet(true)} style={styles.edit}>
              <Text style={styles.editText}>프로필 수정</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.section}>기록 설정</Text>
        <Row icon="bell" label="기록 알림" value={koreanTime(profile.reminder)} onPress={() => setReminderSheet(true)} />
        <Row icon="lock" label="앱 잠금" value="준비 중" onPress={() => toast('앱 잠금은 아직 준비 중이에요.')} />
        <Row icon="record" label="나의 기록" value={`${records.length}개`} onPress={() => router.navigate('/records')} />
        <Row icon="profile" label="계정 관리" value="체험 모드" onPress={() => router.push('/welcome')} />

        <Text style={styles.section}>데이터</Text>
        <Row icon="record" label="기록 백업하기" value="JSON 파일" onPress={doExport} />
        <Row icon="photo" label="백업 불러오기" value="JSON 파일" onPress={doPick} />
        {sampleCount > 0 && (
          <Pressable accessibilityRole="button" onPress={() => setClearSamples(true)} style={styles.textBtn}>
            <Text style={styles.textBtnLabel}>예시 기록 지우기</Text>
          </Pressable>
        )}

        <Text style={styles.footer}>무디와 함께 마음을 천천히 살펴요.</Text>
        <Text style={styles.version}>MOODI {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>

      <NameSheet visible={nameSheet} value={profile.name} onSave={saveName} onClose={() => setNameSheet(false)} />
      <ReminderSheet visible={reminderSheet} value={profile.reminder} onSave={saveReminder} onClose={() => setReminderSheet(false)} />
      <ConfirmDialog
        visible={pending !== null}
        tone="primary"
        title="백업을 불러올까요?"
        message={`${pending?.records.length ?? 0}개의 기록을 찾았어요. 지금 기록과 합쳐요. 같은 기록은 백업 내용으로 바뀌어요.`}
        confirmLabel="합치기"
        onConfirm={doRestore}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        visible={clearSamples}
        title="예시 기록을 지울까요?"
        message={`미리 채워둔 예시 기록 ${sampleCount}개만 지워져요. 직접 쓴 기록은 그대로 남아요.`}
        confirmLabel="지우기"
        onConfirm={doClearSamples}
        onCancel={() => setClearSamples(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  h1: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 24 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#e6dcf8', borderRadius: 24, padding: 18, marginTop: 20 },
  name: { fontSize: 22, fontWeight: '900', color: colors.text },
  tagline: { fontSize: 12, color: colors.textSoft, marginTop: 4 },
  edit: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 22, paddingHorizontal: 18, minHeight: 44, justifyContent: 'center', marginTop: 10 },
  editText: { fontSize: 13, fontWeight: '700', color: colors.text },
  section: { fontSize: 14, fontWeight: '700', color: colors.textSoft, marginTop: 26, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 18, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  rowLabel: { flex: 1, fontSize: 16, color: colors.text },
  rowValue: { fontSize: 13, color: colors.textSoft },
  textBtn: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  textBtnLabel: { fontSize: 14, fontWeight: '700', color: colors.danger },
  footer: { textAlign: 'center', fontSize: 13, color: colors.textSoft, marginTop: 28 },
  version: { textAlign: 'center', fontSize: 12, color: '#b3abc4', marginTop: 8 },
});

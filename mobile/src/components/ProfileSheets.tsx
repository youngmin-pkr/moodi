import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Backdrop } from './Sheets';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';
import { colors } from '../constants/theme';
import { formatTime, Hm, koreanTime, parseTime, stepTime } from '../lib/time';

export const MAX_NAME_LENGTH = 12;

export function NameSheet({ visible, value, onSave, onClose }: { visible: boolean; value: string; onSave: (name: string) => void; onClose: () => void }) {
  // 모달 내용은 닫혀 있을 때 렌더되지 않으므로, 열 때마다 NameForm이 새로 만들어져 입력값이 value로 초기화됩니다.
  return (
    <Backdrop visible={visible} onClose={onClose} center>
      <NameForm value={value} onSave={onSave} onClose={onClose} />
    </Backdrop>
  );
}

function NameForm({ value, onSave, onClose }: { value: string; onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(value);
  const trimmed = name.trim();
  return (
    <>
      <Text style={styles.heading}>프로필 수정</Text>
      <Text style={styles.label}>닉네임</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={MAX_NAME_LENGTH}
        autoFocus
        accessibilityLabel="닉네임"
        placeholder="닉네임을 입력하세요"
        placeholderTextColor="#b3abc4"
        style={styles.input}
        onSubmitEditing={() => trimmed && onSave(trimmed)}
      />
      <Text style={styles.count}>{name.length} / {MAX_NAME_LENGTH}</Text>
      <View style={{ gap: 8, marginTop: 8 }}>
        <PrimaryButton label="저장" disabled={!trimmed} onPress={() => onSave(trimmed)} />
        <PrimaryButton label="닫기" variant="secondary" onPress={onClose} />
      </View>
    </>
  );
}

function Stepper({ label, value, onUp, onDown }: { label: string; value: string; onUp: () => void; onDown: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} 늘리기`} onPress={onUp} hitSlop={8} style={styles.stepBtn}>
        <View style={{ transform: [{ rotate: '90deg' }] }}><Icon name="back" size={20} color={colors.primary} /></View>
      </Pressable>
      <Text style={styles.stepValue} accessibilityLabel={`${label} ${value}`}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} 줄이기`} onPress={onDown} hitSlop={8} style={styles.stepBtn}>
        <View style={{ transform: [{ rotate: '90deg' }] }}><Icon name="next" size={20} color={colors.primary} /></View>
      </Pressable>
    </View>
  );
}

/** 알림 켜기/끄기와 시각 선택. time이 null이면 꺼진 상태입니다. */
export function ReminderSheet({ visible, value, onSave, onTest, onClose }: { visible: boolean; value: string | null; onSave: (time: string | null) => void; onTest: () => void; onClose: () => void }) {
  return (
    <Backdrop visible={visible} onClose={onClose}>
      <ReminderForm value={value} onSave={onSave} onTest={onTest} onClose={onClose} />
    </Backdrop>
  );
}

function ReminderForm({ value, onSave, onTest, onClose }: { value: string | null; onSave: (time: string | null) => void; onTest: () => void; onClose: () => void }) {
  const [on, setOn] = useState(value !== null);
  const [t, setT] = useState<Hm>(parseTime(value) ?? { hour: 21, minute: 0 });
  // 시간을 건드리면 알림을 켠 것으로 봅니다. (꺼 둔 상태에서도 시간을 바로 고를 수 있도록)
  const change = (unit: 'hour' | 'minute', delta: number) => {
    setT((x) => stepTime(x, unit, delta));
    setOn(true);
  };
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return (
    <>
      <Text style={styles.heading}>기록 알림</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>매일 알림 받기</Text>
        <Switch value={on} onValueChange={setOn} trackColor={{ true: colors.primary, false: '#d9d2ea' }} accessibilityLabel="매일 알림 받기" />
      </View>
      <View style={[styles.timeRow, !on && { opacity: 0.55 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="오전 오후 바꾸기" onPress={() => change('hour', 12)} style={styles.ampm}>
          <Text style={styles.ampmText}>{t.hour < 12 ? '오전' : '오후'}</Text>
        </Pressable>
        <Stepper label="시" value={String(h12)} onUp={() => change('hour', 1)} onDown={() => change('hour', -1)} />
        <Text style={styles.colon}>:</Text>
        <Stepper label="분" value={String(t.minute).padStart(2, '0')} onUp={() => change('minute', 5)} onDown={() => change('minute', -5)} />
      </View>
      <Text style={styles.preview}>{on ? `매일 ${koreanTime(formatTime(t))}에 알려드려요.` : '알림을 사용하지 않아요. 시간을 바꾸면 자동으로 켜져요.'}</Text>
      <View style={{ gap: 8, marginTop: 6 }}>
        <PrimaryButton label="저장" onPress={() => onSave(on ? formatTime(t) : null)} />
        <PrimaryButton label="5초 뒤 테스트 알림 받기" variant="secondary" onPress={onTest} />
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textSoft, marginBottom: 6 },
  input: { backgroundColor: '#faf7ff', borderRadius: 14, padding: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  count: { alignSelf: 'flex-end', marginTop: 6, fontSize: 12, color: colors.textSoft },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchText: { fontSize: 16, color: colors.text },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 },
  ampm: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: '#efe9fb' },
  ampmText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  stepper: { alignItems: 'center', gap: 2 },
  stepBtn: { width: 56, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 30, fontWeight: '900', color: colors.text, minWidth: 52, textAlign: 'center' },
  colon: { fontSize: 28, fontWeight: '900', color: colors.text },
  closeBtn: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  closeText: { fontSize: 15, fontWeight: '600', color: colors.textSoft },
  preview: { textAlign: 'center', fontSize: 13, color: colors.textSoft, marginVertical: 14 },
});

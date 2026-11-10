import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { colors, titleFont } from '../constants/theme';

export function Backdrop({ visible, onClose, children, center }: { visible: boolean; onClose: () => void; children: React.ReactNode; center?: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.backdrop, center ? styles.center : styles.bottom]} onPress={onClose} accessibilityLabel="닫기">
        {/* 안쪽을 눌러도 닫히지 않도록 이벤트를 막습니다. */}
        <Pressable style={center ? styles.dialog : styles.sheet} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Icon name={icon} color={colors.primary} />
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

export function PhotoSheet({ visible, onClose, onCamera, onLibrary }: { visible: boolean; onClose: () => void; onCamera: () => void; onLibrary: () => void }) {
  return (
    <Backdrop visible={visible} onClose={onClose}>
      <Text style={styles.heading}>사진 첨부</Text>
      <Row icon="camera" label="카메라로 촬영" onPress={onCamera} />
      <Row icon="photo" label="앨범에서 선택" onPress={onLibrary} />
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
        <Text style={styles.cancelText}>닫기</Text>
      </Pressable>
    </Backdrop>
  );
}

export function ConfirmDialog({
  visible, title, message, confirmLabel, onConfirm, onCancel, tone = 'danger',
}: { visible: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; tone?: 'danger' | 'primary' }) {
  return (
    <Backdrop visible={visible} onClose={onCancel} center>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttons}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.btn, styles.btnGhost]}>
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onConfirm} style={[styles.btn, tone === 'danger' ? styles.btnDanger : styles.btnPrimary]}>
          <Text style={styles.confirmText}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(40,30,60,0.45)' },
  bottom: { justifyContent: 'flex-end' },
  center: { justifyContent: 'center', padding: 28 },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 30 },
  dialog: { backgroundColor: colors.surface, borderRadius: 22, padding: 22 },
  heading: { ...titleFont, fontSize: 18, color: colors.text, marginBottom: 12 },
  message: { fontSize: 15, color: colors.textSoft, lineHeight: 22, marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 16, color: colors.text },
  cancel: { alignItems: 'center', paddingTop: 18 },
  cancelText: { fontSize: 15, color: colors.textSoft, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  btnGhost: { backgroundColor: '#f1ecfa' },
  btnDanger: { backgroundColor: colors.danger },
  btnPrimary: { backgroundColor: colors.primary },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

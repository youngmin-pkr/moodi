import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { ConfirmDialog } from '../../components/Sheets';
import { useToast } from '../../components/Toast';
import { EMOTIONS } from '../../constants/emotions';
import { colors } from '../../constants/theme';
import { dateText } from '../../lib/date';
import { useRecords } from '../../state/RecordsContext';

export default function RecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records, removeRecord } = useRecords();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const rec = records.find((r) => r.id === id);

  if (!rec) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header />
        <Text style={styles.missing}>기록을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }
  const e = EMOTIONS[rec.emotion];

  const remove = async () => {
    setConfirm(false);
    if (await removeRecord(rec.id)) {
      toast('기록을 삭제했어요');
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } else toast('삭제하지 못했어요. 다시 시도해주세요.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: e.soft }]}>
          <Mascot emotion={rec.emotion} size={96} />
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>{dateText(rec.date)}</Text>
            <Text style={styles.emotion}>{e.title}</Text>
          </View>
        </View>
        <Text style={styles.title}>{rec.title}</Text>
        <Text style={styles.body}>{rec.body}</Text>
        {rec.photos.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photo} resizeMode="cover" accessibilityLabel="첨부한 사진" />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/write', params: { id: rec.id } })} style={[styles.action, styles.edit]}>
          <Icon name="edit" size={18} color={colors.primary} />
          <Text style={styles.editText}>수정하기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setConfirm(true)} style={[styles.action, styles.del]}>
          <Icon name="trash" size={18} color={colors.danger} />
          <Text style={styles.delText}>삭제하기</Text>
        </Pressable>
      </View>
      <ConfirmDialog visible={confirm} title="기록을 삭제할까요?" message="삭제한 기록과 사진은 되돌릴 수 없어요." confirmLabel="삭제" onConfirm={remove} onCancel={() => setConfirm(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  missing: { textAlign: 'center', marginTop: 60, color: colors.textSoft },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, padding: 16 },
  date: { fontSize: 13, color: colors.textSoft, fontWeight: '600' },
  emotion: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 20 },
  body: { fontSize: 16, lineHeight: 26, color: colors.text, marginTop: 12 },
  photo: { width: '100%', aspectRatio: 1.3, borderRadius: 18, marginTop: 16, backgroundColor: '#eee' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  action: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16 },
  edit: { backgroundColor: '#efe9fb' },
  del: { backgroundColor: '#fdecee' },
  editText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  delText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});

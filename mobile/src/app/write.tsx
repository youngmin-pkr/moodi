import { useEffect, useRef, useState } from 'react';
import { Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { PhotoSheet } from '../components/Sheets';
import { PrimaryButton } from '../components/PrimaryButton';
import { useToast } from '../components/Toast';
import { EMOTIONS, MAX_CUSTOM_EMOTION_LENGTH, OTHER_EMOTION } from '../constants/emotions';
import { colors, titleFont } from '../constants/theme';
import { dateText, today } from '../lib/date';
import { companion } from '../lib/companion';
import { MAX_BODY_LENGTH, MAX_PHOTOS, newRecordId, normalizeCustomEmotion, validateDraft } from '../lib/records';
import { deletePhotos, pickFromLibrary, takePhoto } from '../lib/photos';
import { useRecords } from '../state/RecordsContext';

/** 새 기록(emotion, date)과 수정(id)을 모두 처리합니다. */
export default function WriteScreen() {
  const params = useLocalSearchParams<{ emotion?: string; date?: string; id?: string }>();
  const { records, addRecord, updateRecord, profile } = useRecords();
  const toast = useToast();
  const editing = params.id ? records.find((r) => r.id === params.id) : undefined;

  const emotion = editing ? editing.emotion : params.emotion !== undefined ? Number(params.emotion) : null;
  const date = editing?.date ?? params.date ?? today();
  const [title, setTitle] = useState(editing?.title ?? '');
  const [body, setBody] = useState(editing?.body ?? '');
  const [custom, setCustom] = useState(editing?.customEmotion ?? '');
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);
  const [sheet, setSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // 저장하지 않고 나가면, 이번에 새로 추가한 사진 파일만 지웁니다.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  const originalRef = useRef(editing?.photos ?? []);
  const savedRef = useRef(false);
  useEffect(
    () => () => {
      if (!savedRef.current) deletePhotos(photosRef.current.filter((p) => !originalRef.current.includes(p)));
    },
    [],
  );

  if (emotion === null || !EMOTIONS[emotion]) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header />
        <Text style={styles.missing}>기록을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const add = async (get: () => Promise<{ uris: string[]; denied?: boolean }>) => {
    setSheet(false);
    // 사진 시트(모달)가 완전히 닫히기 전에 앨범·카메라를 열면 열리지 않는 기기가 있어, 닫힌 뒤에 엽니다.
    await new Promise((resolve) => setTimeout(resolve, 450));
    try {
      const res = await get();
      if (res.denied) toast('카메라 권한이 필요해요. 설정에서 허용해주세요.');
      else if (res.uris.length) setPhotos((p) => [...p, ...res.uris].slice(0, MAX_PHOTOS));
    } catch (e) {
      toast(`사진을 불러오지 못했어요. (${e instanceof Error ? e.message : '알 수 없는 오류'})`);
    }
  };

  const save = async () => {
    if (saving) return;
    // 키보드가 열려 있으면 아래쪽 안내 문구가 가려지므로 먼저 내립니다.
    Keyboard.dismiss();
    const err = validateDraft({ emotion, title, body });
    if (err === 'content') return toast('내용을 입력해주세요');
    if (err === 'tooLong') return toast(`내용은 ${MAX_BODY_LENGTH.toLocaleString()}자까지 쓸 수 있어요.`);
    setSaving(true);
    const data = { date, emotion, title: title.trim(), body: body.trim(), photos, customEmotion: normalizeCustomEmotion(emotion, custom) };
    if (editing) {
      const ok = await updateRecord(editing.id, data);
      setSaving(false);
      if (!ok) return toast('저장 공간이 부족해요. 사진을 줄여 다시 시도해주세요.');
      savedRef.current = true;
      toast('수정했어요');
      router.back();
    } else {
      // 구름의 한마디를 함께 저장합니다. (기능을 껐으면 만들지 않습니다)
      const id = newRecordId();
      const comfort = profile.companion ? (await companion.comfort({ id, emotion, title: data.title, body: data.body })).text : undefined;
      const rec = await addRecord({ ...data, id, comfort });
      setSaving(false);
      if (!rec) return toast('저장 공간이 부족해요. 사진을 줄여 다시 시도해주세요.');
      savedRef.current = true;
      // 감정 선택·작성 화면을 이동 기록에서 비워, 이후 '뒤로'가 홈으로 가도록 합니다.
      if (router.canDismiss()) router.dismissAll();
      router.push({ pathname: '/saved', params: { id: rec.id } });
    }
  };

  const e = EMOTIONS[emotion];
  return (
    <SafeAreaView style={styles.safe}>
      <Header title={editing ? '기록 수정' : undefined} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Text style={styles.date}>{dateText(date)}</Text>
          <View style={styles.top}>
            <Mascot emotion={emotion} size={84} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heading}>{e.title}</Text>
              <Text style={styles.hint}>{e.hint}</Text>
            </View>
          </View>

          {emotion === OTHER_EMOTION && (
            <View style={styles.customBox}>
              <Text style={styles.customLabel}>어떤 감정인가요? (선택)</Text>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                placeholder="예: 뿌듯함, 아쉬움, 외로움"
                placeholderTextColor="#b3abc4"
                maxLength={MAX_CUSTOM_EMOTION_LENGTH}
                accessibilityLabel="감정 이름"
                returnKeyType="next"
                style={styles.customInput}
              />
              <Text style={styles.customHint}>{`적지 않으면 '기타'로 보여요. (${custom.length}/${MAX_CUSTOM_EMOTION_LENGTH})`}</Text>
            </View>
          )}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#b3abc4"
            maxLength={60}
            accessibilityLabel="제목"
            style={styles.titleInput}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="오늘 하루는 어땠나요?"
            placeholderTextColor="#b3abc4"
            multiline
            textAlignVertical="top"
            accessibilityLabel="내용"
            style={styles.bodyInput}
          />
          <Text style={[styles.count, body.length > MAX_BODY_LENGTH && { color: colors.danger }]}>
            {body.length.toLocaleString()} / {MAX_BODY_LENGTH.toLocaleString()}
          </Text>

          <View style={styles.photoRow}>
            {photos.map((uri) => (
              <View key={uri} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} accessibilityLabel="첨부한 사진" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="사진 삭제"
                  onPress={() => {
                    setPhotos((p) => p.filter((x) => x !== uri));
                    if (!originalRef.current.includes(uri)) deletePhotos([uri]);
                  }}
                  style={styles.remove}
                >
                  <Icon name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Pressable accessibilityRole="button" accessibilityLabel="사진 첨부" onPress={() => {
                  Keyboard.dismiss();
                  setSheet(true);
                }}
                style={styles.addPhoto}>
                <Icon name="photo" color={colors.primary} />
                <Text style={styles.addText}>
                  사진 첨부 {photos.length}/{MAX_PHOTOS}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label={editing ? '수정하기' : '저장하기'} onPress={save} disabled={saving} />
        </View>
      </KeyboardAvoidingView>
      <PhotoSheet visible={sheet} onClose={() => setSheet(false)} onCamera={() => add(takePhoto)} onLibrary={() => add(() => pickFromLibrary(MAX_PHOTOS - photos.length))} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  missing: { textAlign: 'center', marginTop: 60, color: colors.textSoft },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  date: { fontSize: 14, color: colors.textSoft, fontWeight: '600' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 10 },
  heading: { ...titleFont, fontSize: 22, color: colors.text },
  hint: { fontSize: 13, color: colors.textSoft, marginTop: 4 },
  customBox: { marginBottom: 12 },
  customLabel: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 6 },
  customInput: { backgroundColor: '#f4ebfa', borderRadius: 16, padding: 14, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  customHint: { fontSize: 12, color: colors.textSoft, marginTop: 5 },
  titleInput: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, fontSize: 17, fontWeight: '700', color: colors.text, borderWidth: 1, borderColor: colors.border },
  bodyInput: { marginTop: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 16, fontSize: 16, lineHeight: 24, minHeight: 180, color: colors.text, borderWidth: 1, borderColor: colors.border },
  count: { alignSelf: 'flex-end', marginTop: 6, fontSize: 12, color: colors.textSoft },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  thumbWrap: { width: 92, height: 92 },
  thumb: { width: 92, height: 92, borderRadius: 14, backgroundColor: '#eee' },
  remove: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: 92, height: 92, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 4 },
  addText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
});

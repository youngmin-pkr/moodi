import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../components/Text';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { Mascot } from '../../components/Mascot';
import { ConfirmDialog } from '../../components/Sheets';
import { colors } from '../../constants/theme';
import { companion, storedComfort } from '../../lib/companion';
import { useRecords } from '../../state/RecordsContext';
import { ChatMessage, DiaryRecord } from '../../types';

const MAX_INPUT = 300;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useRecords();
  const rec = records.find((r) => r.id === id);
  if (!rec) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header />
        <Text style={styles.missing}>기록을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }
  return <Chat rec={rec} />;
}

function Chat({ rec }: { rec: DiaryRecord }) {
  const { setChat } = useRecords();
  // 저장된 대화가 있으면 이어서, 없으면 기록에 남긴 구름의 한마디로 시작합니다.
  const [messages, setMessages] = useState<ChatMessage[]>(() => (rec.chat?.length ? rec.chat : [storedComfort(rec)]));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    void setChat(rec.id, next);
    // 답이 바로 튀어나오면 어색해서, 글자 수에 맞춰 잠깐 '입력 중'을 보여 줍니다.
    const [reply] = await Promise.all([companion.reply(rec, next), sleep(700 + Math.min(text.length * 15, 900))]);
    const after = [...next, reply];
    setMessages(after);
    setBusy(false);
    void setChat(rec.id, after);
  };

  const clear = async () => {
    setConfirmClear(false);
    const start = [storedComfort(rec)];
    setMessages(start);
    await setChat(rec.id, []);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="구름과 이야기" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            지금은 AI가 아니라 <Text style={styles.bold}>미리 준비된 답변</Text>으로 이야기하는 체험 기능이에요. 전문 상담이 아니고, 이야기는 이 기기 안에만 저장돼요.
          </Text>
        </View>

        <ScrollView ref={scroll} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Text style={styles.about} numberOfLines={1}>
            「{rec.title}」에 대해
          </Text>
          {messages.map((m, i) => (
            <Bubble key={i} message={m} emotion={rec.emotion} />
          ))}
          {busy && (
            <View style={styles.row} accessibilityLiveRegion="polite" accessibilityLabel="구름이 입력 중이에요">
              <Mascot emotion={rec.emotion} size={34} />
              <View style={[styles.bubble, styles.bubbleCompanion]}>
                <Text style={styles.typing}>···</Text>
              </View>
            </View>
          )}
          {messages.length > 1 && !busy && (
            <Pressable accessibilityRole="button" onPress={() => setConfirmClear(true)} style={styles.clear}>
              <Text style={styles.clearText}>대화 지우기</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="지금 마음을 편하게 적어 보세요"
            placeholderTextColor="#b3abc4"
            multiline
            maxLength={MAX_INPUT}
            accessibilityLabel="메시지 입력"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="보내기"
            accessibilityState={{ disabled: !input.trim() || busy }}
            onPress={() => {
              Keyboard.dismiss();
              void send();
            }}
            style={[styles.send, (!input.trim() || busy) && styles.sendOff]}
          >
            <Icon name="next" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <ConfirmDialog
        visible={confirmClear}
        title="대화를 지울까요?"
        message="이 기록에서 나눈 대화가 지워져요. 기록 자체는 그대로예요."
        confirmLabel="지우기"
        onConfirm={clear}
        onCancel={() => setConfirmClear(false)}
      />
    </SafeAreaView>
  );
}

function Bubble({ message, emotion }: { message: ChatMessage; emotion: number }) {
  if (message.role === 'user') {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Mascot emotion={emotion} size={34} />
      <View style={[styles.bubble, message.crisis ? styles.bubbleCrisis : styles.bubbleCompanion]}>
        {message.crisis && <Text style={styles.crisisTitle}>도움이 필요할 때</Text>}
        <Text style={styles.companionText} selectable>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  missing: { textAlign: 'center', marginTop: 60, color: colors.textSoft },
  notice: { marginHorizontal: 16, marginBottom: 4, backgroundColor: '#efe9fb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  noticeText: { fontSize: 12, lineHeight: 18, color: colors.textSoft },
  bold: { fontWeight: '800', color: colors.text },
  list: { padding: 16, paddingBottom: 8, gap: 12 },
  about: { alignSelf: 'center', fontSize: 12, color: colors.textSoft, marginBottom: 4, maxWidth: '90%' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 11 },
  bubbleCompanion: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 6 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  bubbleCrisis: { backgroundColor: '#fff1f2', borderWidth: 1.5, borderColor: '#f3b6bb', borderBottomLeftRadius: 6 },
  companionText: { fontSize: 15, lineHeight: 22, color: colors.text },
  userText: { fontSize: 15, lineHeight: 22, color: '#fff' },
  crisisTitle: { fontSize: 13, fontWeight: '800', color: colors.danger, marginBottom: 6 },
  typing: { fontSize: 20, letterSpacing: 2, color: colors.textSoft, lineHeight: 22 },
  clear: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  clearText: { fontSize: 13, color: colors.textSoft, textDecorationLine: 'underline' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.background },
  input: { flex: 1, maxHeight: 120, minHeight: 48, backgroundColor: colors.surface, borderRadius: 24, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendOff: { backgroundColor: '#d9d2ea' },
});

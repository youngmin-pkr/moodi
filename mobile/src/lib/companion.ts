import { ChatMessage, DiaryRecord } from '../types';
import { EMOTIONS } from '../constants/emotions';

/**
 * 구름(마음을 들어주는 친구)의 답변 엔진.
 *
 * 지금은 기기 안에서 미리 써 둔 문장으로 답하는 **체험용(LocalCompanion)** 입니다. AI가 아닙니다.
 * 화면은 `Companion` 인터페이스만 사용하므로, 나중에 서버를 거쳐 실제 AI를 부르는 구현으로 바꿔 끼울 수 있습니다.
 * (실제 AI를 붙일 때는 일기 내용이 밖으로 나가므로 사용자 동의 화면과 서버 쪽 사용량 제한이 먼저 필요합니다.)
 */
export interface Companion {
  /** 기록을 저장할 때 보여 줄 짧은 한마디 */
  comfort(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body'>): Promise<ChatMessage>;
  /** 대화에서 사용자의 새 메시지에 대한 답. history에는 방금 보낸 메시지가 포함됩니다. */
  reply(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body'>, history: readonly ChatMessage[]): Promise<ChatMessage>;
}

export const CRISIS_NUMBERS = { emergency: '119', suicidePrevention: '109' } as const;

// 스스로를 해치려는 의도가 드러나는 표현. 놓치는 것보다 한 번 더 안내하는 쪽이 낫도록 넓게 잡았습니다.
const CRISIS_WORDS = ['죽고 싶', '죽고싶', '죽어버리', '자살', '자해', '목숨을 끊', '사라지고 싶', '살기 싫', '살고 싶지 않', '삶을 끝', '없어지고 싶'];

export function detectCrisis(text: string): boolean {
  const t = text.replace(/\s+/g, ' ');
  return CRISIS_WORDS.some((w) => t.includes(w));
}

const CRISIS_TEXT =
  `지금 마음이 많이 힘든 것 같아서 걱정돼요. 혼자 견디지 않아도 돼요.\n\n` +
  `지금 위험하거나 스스로를 해칠 것 같다면 ${CRISIS_NUMBERS.emergency}에 바로 연락해 주세요. ` +
  `마음이 너무 힘들 땐 자살예방상담전화 ${CRISIS_NUMBERS.suicidePrevention}(24시간)에서 이야기를 들어줘요.\n\n` +
  `가까운 사람에게 지금 연락해 보는 것도 좋아요. 저는 미리 준비된 말만 할 수 있어서 충분히 도와드리지 못해요.`;

const crisisMessage = (): ChatMessage => ({ role: 'companion', text: CRISIS_TEXT, crisis: true });

/** 기록에 저장된 한마디를 화면용 메시지로 바꿉니다. 저장된 것이 없으면 지금 만들어 보여 줍니다. */
export function storedComfort(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body' | 'comfort'>): ChatMessage {
  if (record.comfort) return { role: 'companion', text: record.comfort, ...(record.comfort === CRISIS_TEXT ? { crisis: true } : {}) };
  return comfortFor(record);
}

/** 같은 입력이면 늘 같은 선택이 나오도록(테스트하기 쉽게) 문자열로 고릅니다. */
function pick<T>(items: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

// 감정(EMOTIONS 순서)별 한마디. 조언이나 판단 없이 알아주고 곁에 있어 주는 말만 둡니다.
const COMFORT: readonly (readonly string[])[] = [
  ['오늘의 작은 행복을 기록해 줘서 고마워요. 이 기분이 오래 남았으면 좋겠어요.', '좋은 일이 있었군요! 그 순간을 남겨 둔 오늘의 나, 정말 잘했어요.', '행복한 마음이 여기까지 전해져요. 나중에 꺼내 보면 힘이 될 거예요.'],
  ['두근거리는 마음이 느껴져요. 설레는 하루를 보내고 있군요.', '기대되는 일이 있다니 참 좋아요. 그 설렘을 천천히 즐겨요.', '설레는 마음, 소중하게 적어 두었어요. 어떤 일이 기다리고 있을까요?'],
  ['마음이 평온한 하루였군요. 이런 날은 그 자체로 선물이에요.', '여유로운 하루를 보냈네요. 이 편안함을 기억해 두어요.', '고요한 마음이 느껴져요. 오늘도 잘 보내고 있어요.'],
  ['슬픈 마음을 여기에 내려놓아 줘서 고마워요. 그럴 수 있어요.', '많이 속상했겠어요. 지금은 그냥 그 마음 그대로 있어도 괜찮아요.', '슬픔을 적어 내려간 것만으로도 용기 있는 일이에요. 제가 곁에 있을게요.'],
  ['화가 났던 마음, 충분히 그럴 만해요. 여기서는 마음껏 털어놓아도 돼요.', '많이 답답했겠어요. 그 감정은 잘못이 아니에요.', '속상한 일이 있었군요. 적어 두는 것만으로도 조금은 가벼워질 수 있어요.'],
  ['불안한 마음이 느껴져요. 이렇게 적어 낸 것만으로도 큰 걸음이에요.', '걱정이 많은 하루였군요. 지금 이 순간은 안전해요. 천천히 숨을 쉬어 봐요.', '불안한 마음도 괜찮아요. 하나씩, 천천히 같이 살펴봐요.'],
  ['많이 지쳤군요. 오늘은 잘 쉬는 것도 중요한 일이에요.', '피곤한 하루를 보냈네요. 오늘도 수고했어요. 정말로요.', '몸과 마음이 쉬고 싶다는 신호일지도 몰라요. 오늘은 나를 먼저 챙겨요.'],
  ['마음이 무거운 하루였군요. 혼자 담아 두지 않고 적어 줘서 고마워요.', '우울한 기분을 꺼내 놓는 건 쉽지 않은데, 정말 잘했어요. 여기 있어요.', '지금 마음이 어떻든 괜찮아요. 천천히, 제 속도로 가도 돼요.'],
  ['이름 붙이기 어려운 마음도 여기서는 괜찮아요. 적어 줘서 고마워요.', '말로 다 하기 어려운 감정이 있죠. 그대로 두어도 괜찮아요.', '복잡한 마음이군요. 천천히 들여다봐도 좋고, 그냥 두어도 좋아요.'],
];

export function comfortText(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body'>): string {
  const set = COMFORT[record.emotion] ?? COMFORT[COMFORT.length - 1];
  return pick(set, `${record.id}:${record.title}`);
}

export function comfortFor(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body'>): ChatMessage {
  if (detectCrisis(`${record.title} ${record.body}`)) return crisisMessage();
  return { role: 'companion', text: comfortText(record) };
}

type Topic = { key: string; words: readonly string[]; lines: readonly string[] };

// 위에 있는 주제일수록 먼저 맞춰 봅니다.
const TOPICS: readonly Topic[] = [
  { key: 'thanks', words: ['고마워', '감사', '덕분', '고맙'], lines: ['도움이 됐다니 저도 기뻐요. 언제든 또 이야기하러 와요.', '들려줘서 고마워요. 오늘도 수고 많았어요.'] },
  { key: 'tired', words: ['피곤', '지쳐', '지치', '힘들', '번아웃', '졸려', '쉬고 싶', '지겨'], lines: ['많이 지쳤군요. 오늘 어떤 일이 제일 힘들게 했는지 말해 줄래요?', '그렇게 버텨 온 것만으로도 대단해요. 지금 가장 필요한 건 뭘까요?', '지칠 만큼 애쓴 거예요. 잠깐이라도 쉬는 시간을 나에게 줘도 괜찮아요.'] },
  { key: 'anxious', words: ['불안', '걱정', '무서', '떨려', '긴장', '두려', '초조'], lines: ['불안한 마음이 크군요. 어떤 일이 제일 마음에 걸리나요?', '걱정이 머릿속을 채우고 있나 봐요. 숨을 천천히 들이쉬고 내쉬어 볼까요? 그다음에 이야기해도 좋아요.', '그런 마음이 드는 게 이상한 게 아니에요. 지금 가장 걱정되는 것 하나만 말해 줄래요?'] },
  { key: 'angry', words: ['화나', '화가', '짜증', '열받', '억울', '빡', '분해', '싫어'], lines: ['정말 화가 났겠어요. 무슨 일이 있었는지 편하게 말해 줘요.', '그럴 만한 상황이었던 것 같아요. 제일 속상했던 부분이 뭐예요?', '그 감정, 참지 않아도 돼요. 여기서는 다 말해도 괜찮아요.'] },
  { key: 'sad', words: ['슬프', '외로', '눈물', '보고 싶', '보고싶', '우울', '허전', '공허', '울었', '울고'], lines: ['마음이 많이 아프겠어요. 지금 곁에서 듣고 있어요.', '그런 마음이 들 땐 정말 힘들죠. 언제부터 그랬는지 말해 줄래요?', '혼자라고 느껴질 때가 있죠. 오늘은 제가 여기서 같이 있을게요.'] },
  { key: 'happy', words: ['좋았', '좋아', '행복', '기뻐', '기쁘', '뿌듯', '신나', '즐거', '설레', '웃었', '맛있'], lines: ['듣는 저도 기분이 좋아져요! 그 순간 어땠는지 더 들려줘요.', '좋은 일이 있었군요. 무엇이 제일 기뻤어요?', '그 기분을 오래 기억해 두면 좋겠어요. 누구랑 함께했어요?'] },
];

const GENERIC = [
  '그랬군요. 조금 더 이야기해 줄래요?',
  '말해 줘서 고마워요. 그때 어떤 기분이 들었어요?',
  '듣고 있어요. 그 일에서 제일 마음에 남은 건 뭐예요?',
  '그런 일이 있었군요. 지금은 마음이 어때요?',
];

const SHORT = ['괜찮아요, 천천히 말해도 돼요. 떠오르는 대로 편하게요.', '한 단어여도 좋아요. 지금 마음을 어떻게 부르고 싶어요?'];

const CLOSING = '오늘 이야기 들려줘서 고마워요. 이제 따뜻한 물 한 잔 마시고 잠깐 쉬어볼까요? 내일도 여기서 기다릴게요.';

/** 사용자 메시지에 대한 답. 조언·진단 없이 공감하고 한 번 더 물어보는 방식입니다. */
export function replyFor(record: Pick<DiaryRecord, 'id' | 'emotion' | 'title' | 'body'>, history: readonly ChatMessage[]): ChatMessage {
  const last = [...history].reverse().find((m) => m.role === 'user');
  const text = last?.text.trim() ?? '';
  if (detectCrisis(text)) return crisisMessage();
  const userTurns = history.filter((m) => m.role === 'user').length;
  const seed = `${record.id}:${userTurns}:${text}`;

  if (userTurns >= 8) return { role: 'companion', text: CLOSING };
  if (text.replace(/\s/g, '').length < 3) return { role: 'companion', text: pick(SHORT, seed) };
  const topic = TOPICS.find((t) => t.words.some((w) => text.includes(w)));
  if (topic) return { role: 'companion', text: pick(topic.lines, seed) };
  // 특별한 단어가 없으면 기록의 감정에 맞춰 다정하게 이어 갑니다.
  const base = pick(GENERIC, seed);
  return { role: 'companion', text: userTurns === 1 ? `${EMOTIONS[record.emotion]?.name ?? '오늘'}의 마음이었군요. ${base}` : base };
}

/** 기기 안에서 미리 써 둔 문장으로 답하는 체험용 구현. 실제 AI가 아닙니다. */
export const localCompanion: Companion = {
  async comfort(record) {
    return comfortFor(record);
  },
  async reply(record, history) {
    return replyFor(record, history);
  },
};

/** 앱에서 쓰는 구름. 서버와 실제 AI를 붙일 때 이 한 줄만 바꾸면 됩니다. */
export const companion: Companion = localCompanion;

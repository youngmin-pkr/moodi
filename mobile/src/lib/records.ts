import { DiaryRecord } from '../types';
import { EMOTIONS, MAX_CUSTOM_EMOTION_LENGTH, OTHER_EMOTION } from '../constants/emotions';
import { today, shiftDate } from './date';

export const MAX_BODY_LENGTH = 2000;
export const MAX_PHOTOS = 3;

/** 최신 날짜 우선, 같은 날이면 나중에 만든 기록(큰 id)이 먼저. 예시 기록은 같은 날 안에서 맨 뒤. */
export function sortRecords(records: readonly DiaryRecord[]): DiaryRecord[] {
  return [...records].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      Number(!!a.sample) - Number(!!b.sample) ||
      (Number(b.id) || 0) - (Number(a.id) || 0),
  );
}

export type RecordQuery = {
  /** 'YYYY-MM' */
  month: string;
  /** -1이면 전체 */
  emotion: number;
  search: string;
};

export function queryRecords(records: readonly DiaryRecord[], q: RecordQuery): DiaryRecord[] {
  const needle = q.search.trim().toLowerCase();
  return sortRecords(records).filter(
    (r) =>
      r.date.startsWith(q.month) &&
      (q.emotion < 0 || r.emotion === q.emotion) &&
      (!needle || `${r.title} ${r.body} ${r.customEmotion ?? ''}`.toLowerCase().includes(needle)),
  );
}

/** 화면에 보여 줄 감정 이름. '기타'이고 직접 적은 이름이 있으면 그 이름을 씁니다. */
export function emotionLabel(r: Pick<DiaryRecord, 'emotion' | 'customEmotion'>): string {
  return r.emotion === OTHER_EMOTION && r.customEmotion ? r.customEmotion : EMOTIONS[r.emotion].name;
}

/** 직접 적은 감정 이름을 정리합니다. '기타'가 아니거나 비어 있으면 undefined. */
export function normalizeCustomEmotion(emotion: number, text: string): string | undefined {
  if (emotion !== OTHER_EMOTION) return undefined;
  const v = text.trim().replace(/\s+/g, ' ').slice(0, MAX_CUSTOM_EMOTION_LENGTH);
  return v || undefined;
}

export type DraftError = 'emotion' | 'content' | 'tooLong';

export function validateDraft(d: { emotion: number | null; title: string; body: string }): DraftError | null {
  if (d.emotion === null) return 'emotion';
  if (!d.title.trim() || !d.body.trim()) return 'content';
  if (d.body.length > MAX_BODY_LENGTH) return 'tooLong';
  return null;
}

export function newRecordId(now = Date.now()): string {
  return String(now);
}

export function createSampleRecords(base = today()): DiaryRecord[] {
  return [
    {
      id: 'sample1',
      date: base,
      emotion: 0,
      title: '작은 행복을 발견한 날',
      body: '퇴근길 하늘이 참 예뻤다.\n잠깐 멈춰서 바라보는 것만으로도\n마음이 편안해졌다.\n\n평범한 하루에도 이렇게 작은 행복이\n숨어 있다는 걸 오래 기억하고 싶다.',
      photos: [],
      sample: true,
    },
    { id: 'sample2', date: shiftDate(base, -1), emotion: 2, title: '잠깐의 여유', body: '따뜻한 차 한 잔과 함께 쉬었다.', photos: [], sample: true },
    { id: 'sample3', date: shiftDate(base, -2), emotion: 1, title: '기다리던 약속', body: '좋아하는 사람들과 함께한 시간.', photos: [], sample: true },
  ];
}

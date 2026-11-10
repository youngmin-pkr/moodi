import { DiaryRecord, StatPeriod } from '../types';
import { shiftDate } from './date';
import { EMOTIONS } from '../constants/emotions';
import { sortRecords } from './records';

/**
 * 기준일(anchor)이 속한 기간의 기록만 고릅니다.
 * - week: 기준일을 포함한 최근 7일
 * - month: 기준일이 속한 달 (스토리보드의 '< 2026년 10월 >' 달 이동 UI 기준)
 * - year: 기준일이 속한 해
 */
export function recordsInPeriod(records: readonly DiaryRecord[], period: StatPeriod, anchor: string): DiaryRecord[] {
  return records.filter((r) => {
    if (period === 'year') return r.date.slice(0, 4) === anchor.slice(0, 4);
    if (period === 'month') return r.date.slice(0, 7) === anchor.slice(0, 7);
    return r.date <= anchor && r.date >= shiftDate(anchor, -6);
  });
}

export function countByEmotion(records: readonly DiaryRecord[]): number[] {
  const counts = EMOTIONS.map(() => 0);
  for (const r of records) if (counts[r.emotion] !== undefined) counts[r.emotion] += 1;
  return counts;
}

/** 가장 많이 기록된 감정의 인덱스. 기록이 없으면 null, 동률이면 앞쪽 감정. */
export function topEmotion(counts: readonly number[]): number | null {
  const max = Math.max(...counts);
  return max > 0 ? counts.indexOf(max) : null;
}

/** 감정별 백분율(반올림). 기록이 없으면 모두 0. */
export function ratios(counts: readonly number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  return counts.map((n) => (total ? Math.round((n / total) * 100) : 0));
}

/** 연간 막대그래프용: 1~12월 기록 수 */
export function countByMonth(records: readonly DiaryRecord[]): number[] {
  const months = Array.from({ length: 12 }, () => 0);
  for (const r of records) {
    const m = Number(r.date.slice(5, 7));
    if (m >= 1 && m <= 12) months[m - 1] += 1;
  }
  return months;
}

/** 통계 화면에서 감정을 눌렀을 때 열 달. 연간은 그 감정이 있는 첫 달, 나머지는 기준일의 달. */
export function monthForEmotion(
  records: readonly DiaryRecord[],
  period: StatPeriod,
  anchor: string,
  emotion: number,
): string {
  if (period !== 'year') return anchor.slice(0, 7);
  const first = records
    .filter((r) => r.emotion === emotion && r.date.slice(0, 4) === anchor.slice(0, 4))
    .map((r) => r.date)
    .sort()[0];
  return (first ?? anchor).slice(0, 7);
}

const hasFinalConsonant = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};

/** 받침에 따라 조사를 붙입니다. 예: 행복+을/를 → '행복을', 기타 → '기타를' */
export function withJosa(word: string, withFinal: string, withoutFinal: string): string {
  return word + (hasFinalConsonant(word) ? withFinal : withoutFinal);
}

/** 기록이 있는 서로 다른 날짜 수 */
export function distinctDays(records: readonly DiaryRecord[]): number {
  return new Set(records.map((r) => r.date)).size;
}

/** 기준일 포함 최근 7일(오래된 날 → 기준일)과 그날의 대표 기록(같은 날이면 정렬상 첫 기록) */
export function weekDays(records: readonly DiaryRecord[], anchor: string): { date: string; record: DiaryRecord | null }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = shiftDate(anchor, i - 6);
    return { date, record: sortRecords(records).find((r) => r.date === date) ?? null };
  });
}

export type Hm = { hour: number; minute: number };

export function parseTime(s: string | null): Hm | null {
  const m = s ? /^(\d{2}):(\d{2})$/.exec(s) : null;
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}

export function formatTime({ hour, minute }: Hm): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** '21:00' → '오후 9:00', '00:05' → '오전 12:05' */
export function koreanTime(s: string | null): string {
  const t = parseTime(s);
  if (!t) return '사용 안 함';
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return `${t.hour < 12 ? '오전' : '오후'} ${h12}:${String(t.minute).padStart(2, '0')}`;
}

/** 시·분을 증감합니다. 시는 0~23, 분은 0~59로 돌아갑니다. */
export function stepTime(t: Hm, unit: 'hour' | 'minute', delta: number): Hm {
  if (unit === 'hour') return { ...t, hour: (t.hour + delta + 24) % 24 };
  return { ...t, minute: (t.minute + delta + 60) % 60 };
}

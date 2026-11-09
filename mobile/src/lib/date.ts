const pad = (n: number) => String(n).padStart(2, '0');

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return toDateString(new Date());
}

/** 'YYYY-MM-DD'를 정오 기준 Date로 바꿉니다. (일광절약 경계에서 하루가 밀리지 않도록) */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function shiftDate(s: string, days: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/** 'YYYY-MM' 기준으로 months만큼 이동합니다. */
export function shiftMonth(ym: string, months: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + months, 1, 12);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 예: '2026년 10월 22일 목요일' / short: '10월 22일 (목)' */
export function dateText(s: string, long = true): string {
  const d = parseDate(s);
  const base = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  const wd = WEEKDAYS[d.getDay()];
  return long ? `${d.getFullYear()}년 ${base} ${wd}요일` : `${base} (${wd})`;
}

export function isValidDateString(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toDateString(parseDate(s)) === s;
}

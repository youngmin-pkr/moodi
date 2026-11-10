import { Backup, ChatMessage, DiaryRecord, Profile } from '../types';
import { EMOTIONS, MAX_CUSTOM_EMOTION_LENGTH, OTHER_EMOTION } from '../constants/emotions';
import { isValidDateString } from './date';

export function createBackup(records: readonly DiaryRecord[], profile: Profile, now = new Date()): Backup {
  return { version: 1, exportedAt: now.toISOString(), records: [...records], profile };
}

export function backupFileName(date: string): string {
  return `moodi-backup-${date}.json`;
}

export class BackupError extends Error {}

const MAX_COMFORT_LENGTH = 500;
const MAX_CHAT_MESSAGES = 80;
const MAX_CHAT_TEXT = 1000;

function sanitizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if ((m.role !== 'user' && m.role !== 'companion') || typeof m.text !== 'string' || !m.text.trim()) return null;
  const msg: ChatMessage = { role: m.role, text: m.text.slice(0, MAX_CHAT_TEXT) };
  if (m.crisis === true && m.role === 'companion') msg.crisis = true;
  return msg;
}

function sanitizeRecord(raw: unknown): DiaryRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' && typeof r.id !== 'number') return null;
  if (!isValidDateString(r.date)) return null;
  if (!Number.isInteger(r.emotion) || (r.emotion as number) < 0 || (r.emotion as number) >= EMOTIONS.length) return null;
  if (typeof r.title !== 'string' || typeof r.body !== 'string') return null;
  const photos = Array.isArray(r.photos) ? r.photos.filter((p): p is string => typeof p === 'string').slice(0, 3) : [];
  const rec: DiaryRecord = { id: String(r.id), date: r.date, emotion: r.emotion as number, title: r.title, body: r.body, photos };
  if (r.sample === true) rec.sample = true;
  if (typeof r.comfort === 'string' && r.comfort.trim()) rec.comfort = r.comfort.slice(0, MAX_COMFORT_LENGTH);
  if (Array.isArray(r.chat)) {
    const chat = r.chat.map(sanitizeMessage).filter((m): m is ChatMessage => m !== null).slice(0, MAX_CHAT_MESSAGES);
    if (chat.length) rec.chat = chat;
  }
  if (rec.emotion === OTHER_EMOTION && typeof r.customEmotion === 'string') {
    const custom = r.customEmotion.trim().slice(0, MAX_CUSTOM_EMOTION_LENGTH);
    if (custom) rec.customEmotion = custom;
  }
  return rec;
}

/** 백업 파일 내용을 검사해서 기록과 프로필을 돌려줍니다. 형식이 잘못되면 BackupError. */
export function parseBackup(text: string): { records: DiaryRecord[]; profile: Profile | null; skipped: number } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('백업 파일을 읽을 수 없어요.');
  }
  if (!data || typeof data !== 'object' || !Array.isArray((data as Backup).records)) {
    throw new BackupError('MOODI 백업 파일이 아니에요.');
  }
  const rawRecords = (data as Backup).records as unknown[];
  const records = rawRecords.map(sanitizeRecord).filter((r): r is DiaryRecord => r !== null);
  const p = (data as Backup).profile as Partial<Profile> | undefined;
  const profile: Profile | null =
    p && typeof p.name === 'string'
      ? {
          name: p.name.slice(0, 12) || '무디',
          reminder: typeof p.reminder === 'string' && /^\d{2}:\d{2}$/.test(p.reminder) ? p.reminder : null,
          companion: typeof p.companion === 'boolean' ? p.companion : true,
        }
      : null;
  return { records, profile, skipped: rawRecords.length - records.length };
}

/** 같은 id의 기록은 백업 내용으로 덮어쓰고, 나머지 기존 기록은 그대로 둡니다. */
export function mergeRecords(current: readonly DiaryRecord[], incoming: readonly DiaryRecord[]): DiaryRecord[] {
  const map = new Map(current.map((r) => [r.id, r]));
  for (const r of incoming) map.set(r.id, r);
  return [...map.values()];
}

import { shiftDate, shiftMonth, dateText, isValidDateString, monthDay, shiftMonthClamped } from '../date';
import { sortRecords, queryRecords, validateDraft, createSampleRecords } from '../records';
import { recordsInPeriod, countByEmotion, topEmotion, ratios, countByMonth, monthForEmotion, withJosa, distinctDays, weekDays } from '../stats';
import { createBackup, parseBackup, mergeRecords, BackupError } from '../backup';
import { DiaryRecord } from '../../types';

const rec = (id: string, date: string, emotion: number, extra: Partial<DiaryRecord> = {}): DiaryRecord => ({
  id, date, emotion, title: `t${id}`, body: `b${id}`, photos: [], ...extra,
});

describe('date', () => {
  it('shifts days across month and year boundaries', () => {
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftDate('2024-03-01', -1)).toBe('2024-02-29');
  });
  it('shifts months', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
  it('formats Korean date text', () => {
    expect(dateText('2026-10-22')).toBe('2026년 10월 22일 목요일');
    expect(dateText('2026-10-22', false)).toBe('10월 22일 (목)');
  });
  it('validates date strings', () => {
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('2026-02-28')).toBe(true);
    expect(isValidDateString(20260228)).toBe(false);
  });
});

describe('records', () => {
  it('puts new entries ahead of same-day sample records', () => {
    const list = sortRecords([rec('sample1', '2026-10-27', 0, { sample: true }), rec('1700000000000', '2026-10-27', 1), rec('1600000000000', '2026-10-28', 2)]);
    expect(list.map((r) => r.id)).toEqual(['1600000000000', '1700000000000', 'sample1']);
  });
  it('filters by month, emotion and search text', () => {
    const rs = [rec('1', '2026-10-01', 0, { title: '산책' }), rec('2', '2026-10-02', 1, { body: '친구와 산책' }), rec('3', '2026-09-30', 0, { title: '산책' })];
    expect(queryRecords(rs, { month: '2026-10', emotion: -1, search: '' }).map((r) => r.id)).toEqual(['2', '1']);
    expect(queryRecords(rs, { month: '2026-10', emotion: 0, search: '' }).map((r) => r.id)).toEqual(['1']);
    expect(queryRecords(rs, { month: '2026-10', emotion: -1, search: ' 산책 ' }).map((r) => r.id)).toEqual(['2', '1']);
  });
  it('validates drafts', () => {
    expect(validateDraft({ emotion: null, title: 'a', body: 'b' })).toBe('emotion');
    expect(validateDraft({ emotion: 0, title: ' ', body: 'b' })).toBe('content');
    expect(validateDraft({ emotion: 0, title: 'a', body: 'x'.repeat(2001) })).toBe('tooLong');
    expect(validateDraft({ emotion: 0, title: 'a', body: 'x'.repeat(2000) })).toBeNull();
  });
  it('creates three sample records on consecutive days', () => {
    expect(createSampleRecords('2026-10-27').map((r) => r.date)).toEqual(['2026-10-27', '2026-10-26', '2026-10-25']);
  });
});

describe('stats', () => {
  const rs = [rec('1', '2026-10-22', 0), rec('2', '2026-10-16', 0), rec('3', '2026-10-15', 1), rec('4', '2026-09-30', 2), rec('5', '2025-12-01', 3)];
  it('week = anchor day plus previous 6 days', () => {
    expect(recordsInPeriod(rs, 'week', '2026-10-22').map((r) => r.id)).toEqual(['1', '2']);
  });
  it('month and year', () => {
    expect(recordsInPeriod(rs, 'month', '2026-10-22')).toHaveLength(3);
    expect(recordsInPeriod(rs, 'year', '2026-10-22')).toHaveLength(4);
  });
  it('counts, top, ratios', () => {
    const counts = countByEmotion(rs);
    expect(counts.slice(0, 4)).toEqual([2, 1, 1, 1]);
    expect(topEmotion(counts)).toBe(0);
    expect(topEmotion(countByEmotion([]))).toBeNull();
    expect(ratios(countByEmotion([]))).toEqual(Array(9).fill(0));
    expect(ratios([1, 1, 2, 0, 0, 0, 0, 0, 0])).toEqual([25, 25, 50, 0, 0, 0, 0, 0, 0]);
  });
  it('counts by month', () => {
    expect(countByMonth(rs)[9]).toBe(3);
    expect(countByMonth(rs)[8]).toBe(1);
  });
  it('opens the right month for an emotion', () => {
    expect(monthForEmotion(rs, 'month', '2026-10-22', 0)).toBe('2026-10');
    expect(monthForEmotion(rs, 'year', '2026-10-22', 2)).toBe('2026-09');
    expect(monthForEmotion(rs, 'year', '2026-10-22', 5)).toBe('2026-10');
  });
});

describe('backup', () => {
  const profile = { name: '무디', reminder: '21:00' };
  it('round-trips records and profile', () => {
    const rs = [rec('1', '2026-10-22', 0, { photos: ['data:image/jpeg;base64,AAA'] })];
    const parsed = parseBackup(JSON.stringify(createBackup(rs, profile)));
    expect(parsed.records).toEqual(rs);
    expect(parsed.profile).toEqual(profile);
    expect(parsed.skipped).toBe(0);
  });
  it('reads a web-app backup (numeric ids, sample flag, 21:00 reminder)', () => {
    const web = { version: 1, exportedAt: '2026-10-27T00:00:00Z', profile: { name: '민', reminder: '21:00' },
      records: [{ id: 1730000000000, date: '2026-10-27', emotion: 4, title: 'a', body: 'b', photos: [], sample: true }] };
    const parsed = parseBackup(JSON.stringify(web));
    expect(parsed.records[0]).toMatchObject({ id: '1730000000000', sample: true });
    expect(parsed.profile).toEqual({ name: '민', reminder: '21:00' });
  });
  it('skips broken records and rejects non-backup files', () => {
    const text = JSON.stringify({ records: [rec('1', '2026-10-22', 0), { id: 'x', date: 'bad', emotion: 0, title: '', body: '' }, { id: 'y', date: '2026-10-22', emotion: 99, title: 'a', body: 'b' }] });
    const parsed = parseBackup(text);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.skipped).toBe(2);
    expect(() => parseBackup('not json')).toThrow(BackupError);
    expect(() => parseBackup('{"a":1}')).toThrow(BackupError);
  });
  it('merges by id with backup winning', () => {
    const merged = mergeRecords([rec('1', '2026-10-01', 0), rec('2', '2026-10-02', 0)], [rec('2', '2026-10-02', 5), rec('3', '2026-10-03', 1)]);
    expect(merged.map((r) => [r.id, r.emotion])).toEqual([['1', 0], ['2', 5], ['3', 1]]);
  });
});

describe('stats helpers', () => {
  it('clamps month shifts to the last day', () => {
    expect(shiftMonthClamped('2026-01-31', 1)).toBe('2026-02-28');
    expect(shiftMonthClamped('2026-03-31', -1)).toBe('2026-02-28');
    expect(shiftMonthClamped('2026-10-22', 1)).toBe('2026-11-22');
    expect(shiftMonthClamped('2024-02-29', 12)).toBe('2025-02-28');
    expect(shiftMonthClamped('2026-01-15', -1)).toBe('2025-12-15');
  });
  it('formats month/day', () => {
    expect(monthDay('2026-10-03')).toBe('10월 3일');
  });
  it('attaches Korean particles by final consonant', () => {
    expect(withJosa('행복', '을', '를')).toBe('행복을');
    expect(withJosa('기타', '을', '를')).toBe('기타를');
    expect(withJosa('우울', '이에요', '예요')).toBe('우울이에요');
    expect(withJosa('기타', '이에요', '예요')).toBe('기타예요');
  });
  it('counts distinct days and builds the 7-day strip', () => {
    const rs = [rec('1', '2026-10-22', 0), rec('2', '2026-10-22', 1), rec('3', '2026-10-20', 2)];
    expect(distinctDays(rs)).toBe(2);
    const strip = weekDays(rs, '2026-10-22');
    expect(strip.map((d) => d.date)[0]).toBe('2026-10-16');
    expect(strip[6].date).toBe('2026-10-22');
    expect(strip[6].record?.id).toBe('2'); // 같은 날이면 나중에 만든 기록
    expect(strip[4].record?.id).toBe('3'); // 10-20
    expect(strip[0].record).toBeNull();
  });
});

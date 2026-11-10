import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryRecord, Profile } from '../types';
import { createSampleRecords } from './records';

// 웹앱과 같은 키 이름을 씁니다.
const RECORDS_KEY = 'moodi.records';
const PROFILE_KEY = 'moodi.profile';

export const DEFAULT_PROFILE: Profile = { name: '무디', reminder: null, companion: true };

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** 저장된 기록이 한 번도 없으면(첫 실행) 예시 기록 3개를 돌려줍니다. */
export async function loadRecords(): Promise<DiaryRecord[]> {
  const saved = await readJson<DiaryRecord[]>(RECORDS_KEY);
  return saved ?? createSampleRecords();
}

export async function loadProfile(): Promise<Profile> {
  const saved = await readJson<Partial<Profile>>(PROFILE_KEY);
  return { ...DEFAULT_PROFILE, ...saved };
}

/** 저장 성공 여부를 돌려줍니다. 실패하면 화면에서 안내합니다. */
export async function saveRecords(records: readonly DiaryRecord[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export async function saveProfile(profile: Profile): Promise<boolean> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

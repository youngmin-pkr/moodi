import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChatMessage, DiaryRecord, Profile } from '../types';
import { DEFAULT_PROFILE, loadProfile, loadRecords, saveProfile, saveRecords } from '../lib/storage';
import { deletePhotos } from '../lib/photos';
import { newRecordId } from '../lib/records';

type NewRecord = Omit<DiaryRecord, 'id' | 'sample'> & { id?: string };

type Ctx = {
  ready: boolean;
  records: DiaryRecord[];
  profile: Profile;
  /** 저장에 성공하면 기록을, 실패하면 null을 돌려줍니다. */
  addRecord: (r: NewRecord) => Promise<DiaryRecord | null>;
  updateRecord: (id: string, r: NewRecord) => Promise<boolean>;
  removeRecord: (id: string) => Promise<boolean>;
  /** 기록에 달린 구름과의 대화를 저장합니다. 비어 있으면 대화를 지웁니다. */
  setChat: (id: string, chat: ChatMessage[]) => Promise<boolean>;
  updateProfile: (p: Partial<Profile>) => Promise<boolean>;
  /** 백업 복원 등으로 기록 전체를 바꿀 때 사용합니다. */
  replaceRecords: (r: DiaryRecord[]) => Promise<boolean>;
};

const RecordsContext = createContext<Ctx | null>(null);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [records, setRecords] = useState<DiaryRecord[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  // 연속 저장 때 오래된 상태를 덮어쓰지 않도록 최신 값을 ref로도 들고 있습니다.
  const recordsRef = useRef<DiaryRecord[]>([]);

  useEffect(() => {
    (async () => {
      const [r, p] = await Promise.all([loadRecords(), loadProfile()]);
      recordsRef.current = r;
      setRecords(r);
      setProfile(p);
      setReady(true);
    })();
  }, []);

  const commit = useCallback(async (next: DiaryRecord[]) => {
    const ok = await saveRecords(next);
    if (ok) {
      recordsRef.current = next;
      setRecords(next);
    }
    return ok;
  }, []);

  const addRecord = useCallback<Ctx['addRecord']>(
    async (r) => {
      const rec: DiaryRecord = { ...r, id: r.id ?? newRecordId() };
      return (await commit([...recordsRef.current, rec])) ? rec : null;
    },
    [commit],
  );

  const updateRecord = useCallback<Ctx['updateRecord']>(
    async (id, r) => {
      const old = recordsRef.current.find((x) => x.id === id);
      if (!old) return false;
      // 글을 고쳐도 구름의 한마디와 대화는 그대로 둡니다.
      const ok = await commit(recordsRef.current.map((x) => (x.id === id ? { ...r, id, sample: x.sample, comfort: r.comfort ?? x.comfort, chat: r.chat ?? x.chat } : x)));
      if (ok) deletePhotos(old.photos.filter((p) => !r.photos.includes(p)));
      return ok;
    },
    [commit],
  );

  const removeRecord = useCallback<Ctx['removeRecord']>(
    async (id) => {
      const old = recordsRef.current.find((x) => x.id === id);
      const ok = await commit(recordsRef.current.filter((x) => x.id !== id));
      if (ok && old) deletePhotos(old.photos);
      return ok;
    },
    [commit],
  );

  const setChat = useCallback<Ctx['setChat']>(
    (id, chat) => commit(recordsRef.current.map((x) => (x.id === id ? { ...x, chat: chat.length ? chat : undefined } : x))),
    [commit],
  );

  const updateProfile = useCallback<Ctx['updateProfile']>(
    async (p) => {
      const next = { ...profile, ...p };
      const ok = await saveProfile(next);
      if (ok) setProfile(next);
      return ok;
    },
    [profile],
  );

  const replaceRecords = useCallback<Ctx['replaceRecords']>((r) => commit(r), [commit]);

  const value = useMemo(
    () => ({ ready, records, profile, addRecord, updateRecord, removeRecord, setChat, updateProfile, replaceRecords }),
    [ready, records, profile, addRecord, updateRecord, removeRecord, setChat, updateProfile, replaceRecords],
  );
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords(): Ctx {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('RecordsProvider 안에서만 사용할 수 있어요.');
  return ctx;
}

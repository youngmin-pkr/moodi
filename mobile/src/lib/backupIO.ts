import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { DiaryRecord, Profile } from '../types';
import { backupFileName, BackupError, createBackup, parseBackup } from './backup';
import { today } from './date';
import { dataUriToPhoto, photoToDataUri } from './photos';

export type ExportResult = 'shared' | 'unavailable' | 'error';

/** 기록과 사진을 JSON 파일로 만들어 공유 시트(파일 저장·메일·메신저 등)로 내보냅니다. */
export async function exportBackup(records: readonly DiaryRecord[], profile: Profile): Promise<ExportResult> {
  try {
    // 사진은 파일 주소 대신 base64로 담아야 다른 기기에서도 복원됩니다.
    const portable = records.map((r) => ({ ...r, photos: r.photos.map(photoToDataUri).filter((p): p is string => p !== null) }));
    const text = JSON.stringify(createBackup(portable, profile), null, 2);
    const name = backupFileName(today());

    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return 'shared';
    }

    if (!(await Sharing.isAvailableAsync())) return 'unavailable';
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.writeSync(text);
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'MOODI 기록 백업' });
    return 'shared';
  } catch {
    return 'error';
  }
}

export type PickedBackup = { records: DiaryRecord[]; profile: Profile | null; skipped: number };

/** 백업 파일을 골라 내용을 검사합니다. 사진은 아직 data URI 그대로입니다. 취소하면 null, 형식이 틀리면 BackupError. */
export async function pickBackup(): Promise<PickedBackup | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (res.canceled) return null;
  const asset = res.assets[0];
  let text: string;
  try {
    text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  } catch {
    throw new BackupError('백업 파일을 읽을 수 없어요.');
  }
  return parseBackup(text);
}

/** 사용자가 복원을 확인한 뒤에 호출합니다. data URI 사진을 앱 파일로 저장하고, 저장하지 못한 사진은 뺍니다. */
export function materializePhotos(records: readonly DiaryRecord[]): DiaryRecord[] {
  return records.map((r) => ({ ...r, photos: r.photos.map(dataUriToPhoto).filter((p): p is string => p !== null) }));
}


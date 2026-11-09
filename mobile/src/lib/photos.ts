import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';
import { MAX_PHOTOS } from './records';

const MAX_SIDE = 1000;
const QUALITY = 0.75;

function photoDir(): Directory {
  const dir = new Directory(Paths.document, 'photos');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** 긴 변이 1,000px을 넘으면 줄여서 JPEG로 저장하고, 앱 문서 폴더에 복사한 파일 URI를 돌려줍니다. */
async function compressAndStore(uri: string, width: number, height: number): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  const long = Math.max(width, height);
  if (long > MAX_SIDE) {
    ctx.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY });
  const dest = new File(photoDir(), `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
  new File(result.uri).copySync(dest);
  return dest.uri;
}

export type PickResult = { uris: string[]; denied?: boolean };

export async function pickFromLibrary(remaining: number): Promise<PickResult> {
  if (remaining <= 0) return { uris: [] };
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: remaining > 1,
    selectionLimit: remaining,
    quality: 1,
  });
  if (res.canceled) return { uris: [] };
  const uris: string[] = [];
  for (const a of res.assets.slice(0, remaining)) uris.push(await compressAndStore(a.uri, a.width, a.height));
  return { uris };
}

export async function takePhoto(): Promise<PickResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { uris: [], denied: true };
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (res.canceled) return { uris: [] };
  const a = res.assets[0];
  return { uris: [await compressAndStore(a.uri, a.width, a.height)] };
}

export function deletePhotos(uris: readonly string[]): void {
  for (const uri of uris) {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // 이미 지워졌거나 접근할 수 없는 파일은 무시합니다.
    }
  }
}

export const canAddPhoto = (count: number) => count < MAX_PHOTOS;

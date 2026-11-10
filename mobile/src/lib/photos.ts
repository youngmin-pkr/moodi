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

const reason = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 80);

/** 단계가 어디서 실패했는지 알 수 있도록 오류 메시지에 단계 이름을 붙입니다. */
async function step<T>(name: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    console.warn(`[photos] ${name} 실패`, e);
    throw new Error(`${name} 실패: ${reason(e)}`);
  }
}

export async function pickFromLibrary(remaining: number): Promise<PickResult> {
  if (remaining <= 0) return { uris: [] };
  const res = await step('앨범 열기', () =>
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 1,
    }),
  );
  if (res.canceled) return { uris: [] };
  const uris: string[] = [];
  for (const a of res.assets.slice(0, remaining)) {
    uris.push(await step('사진 처리', () => compressAndStore(a.uri, a.width, a.height)));
  }
  return { uris };
}

export async function takePhoto(): Promise<PickResult> {
  const perm = await step('카메라 권한', () => ImagePicker.requestCameraPermissionsAsync());
  if (!perm.granted) return { uris: [], denied: true };
  const res = await step('카메라 열기', () => ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }));
  if (res.canceled) return { uris: [] };
  const a = res.assets[0];
  return { uris: [await step('사진 처리', () => compressAndStore(a.uri, a.width, a.height))] };
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

/** 백업에 담기 위해 사진 파일을 data URI(base64)로 바꿉니다. 읽을 수 없으면 null. */
export function photoToDataUri(uri: string): string | null {
  if (uri.startsWith('data:')) return uri;
  try {
    return `data:image/jpeg;base64,${new File(uri).base64Sync()}`;
  } catch {
    return null;
  }
}

/** 백업의 data URI 사진을 앱 파일로 되돌립니다. 이미 파일 주소면 그대로 둡니다. */
export function dataUriToPhoto(uri: string): string | null {
  const m = /^data:image\/[a-z+.-]+;base64,(.+)$/i.exec(uri);
  if (!m) return uri.startsWith('data:') ? null : uri;
  try {
    const dest = new File(photoDir(), `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
    dest.create();
    dest.writeSync(m[1], { encoding: 'base64' });
    return dest.uri;
  } catch {
    return null;
  }
}

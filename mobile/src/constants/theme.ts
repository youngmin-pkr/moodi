export const colors = {
  primary: '#7c61ce',
  background: '#faf7ff',
  surface: '#ffffff',
  text: '#3f3556',
  textSoft: '#80778e',
  border: '#e8e1f5',
  danger: '#d9646e',
} as const;

// 글꼴 이름은 _layout.tsx의 useFonts에 등록한 이름과 같아야 합니다.
export const fonts = {
  /** 본문 (Pretendard Regular) */
  regular: 'Pretendard-Regular',
  /** 중간 굵기 (Pretendard Medium) */
  medium: 'Pretendard-Medium',
  /** 제목·강조 (Pretendard Bold) */
  bold: 'Pretendard-Bold',
  /** 로고(MOODI)만 쓰는 넓고 굵은 영문 글꼴 (Syncopate Bold) */
  brand: 'Syncopate_700Bold',
} as const;

/**
 * fontWeight(숫자/문자)에 맞는 Pretendard 파일 이름. 앱에는 Regular·Medium·Bold 세 가지만 들어 있습니다.
 * 100~400 → Regular, 500~600 → Medium, 700 이상 → Bold.
 */
export function fontFamilyForWeight(weight?: string | number): string {
  const n = weight === 'bold' ? 700 : weight === undefined || weight === 'normal' ? 400 : Number(weight);
  if (n >= 700) return fonts.bold;
  if (n >= 500) return fonts.medium;
  return fonts.regular;
}

/** 제목 글꼴 스타일. 굵기는 글꼴 파일 자체에 들어 있어 fontWeight를 따로 주지 않습니다. */
export const titleFont = { fontFamily: fonts.bold, fontWeight: 'normal' as const };
export const brandFont = { fontFamily: fonts.brand, fontWeight: 'normal' as const };

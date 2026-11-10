export const colors = {
  primary: '#7c61ce',
  background: '#faf7ff',
  surface: '#ffffff',
  text: '#3f3556',
  textSoft: '#80778e',
  border: '#e8e1f5',
  danger: '#d9646e',
} as const;

// 글꼴 이름은 _layout.tsx에서 불러오는 이름과 같아야 합니다.
export const fonts = {
  /** 제목·큰 숫자: 둥글고 귀여운 한글 글꼴 (Jua) */
  title: 'Jua_400Regular',
  /** 로고: 굵고 넓은 기하학적 영문 글꼴 (Syncopate Bold) */
  brand: 'Syncopate_700Bold',
} as const;

/** 제목 글꼴 스타일. 이 글꼴은 자체가 굵어서 fontWeight를 따로 주지 않습니다. */
export const titleFont = { fontFamily: fonts.title, fontWeight: 'normal' as const };
export const brandFont = { fontFamily: fonts.brand, fontWeight: 'normal' as const };

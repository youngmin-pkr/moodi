export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NICKNAME_LENGTH = 12;

// 완벽한 이메일 검증은 불가능하므로 '@' 앞뒤와 도메인 점 정도만 확인합니다.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return '이메일을 입력해주세요.';
  return EMAIL.test(v) ? null : '이메일 형식이 맞지 않아요.';
}

export function passwordError(value: string): string | null {
  if (!value) return '비밀번호를 입력해주세요.';
  return value.length >= MIN_PASSWORD_LENGTH ? null : `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상 입력해주세요.`;
}

export function nicknameError(value: string): string | null {
  const v = value.trim();
  if (!v) return '닉네임을 입력해주세요.';
  return v.length <= MAX_NICKNAME_LENGTH ? null : `닉네임은 ${MAX_NICKNAME_LENGTH}자까지 쓸 수 있어요.`;
}

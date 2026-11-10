export type ChatMessage = {
  role: 'user' | 'companion';
  text: string;
  /** 위기 신호에 대한 도움 안내 메시지 (화면에서 다르게 보여 줍니다) */
  crisis?: boolean;
};

export type DiaryRecord = {
  id: string;
  /** 'YYYY-MM-DD' (기기의 현지 날짜) */
  date: string;
  /** EMOTIONS 배열의 인덱스 */
  emotion: number;
  /** 감정이 '기타'일 때 사용자가 직접 적은 감정 이름 (없으면 '기타'로 표시) */
  customEmotion?: string;
  title: string;
  body: string;
  /** 사진 주소. 앱에서는 파일 URI, 웹 백업에서는 data URI일 수 있습니다. */
  photos: string[];
  /** 첫 실행 때 보여주는 예시 기록 */
  sample?: boolean;
  /** 기록을 저장할 때 구름이 남긴 한마디 */
  comfort?: string;
  /** 이 기록에 대해 구름과 나눈 대화 */
  chat?: ChatMessage[];
};

export type Profile = {
  name: string;
  /** 'HH:mm' 또는 알림을 끈 경우 null */
  reminder: string | null;
  /** 구름의 한마디·대화 기능 사용 여부 (기본 켜짐) */
  companion: boolean;
};

export type StatPeriod = 'week' | 'month' | 'year';

/** 웹앱(app.js)이 내보내는 백업 형식과 같습니다. 웹 백업도 앱에서 복원할 수 있습니다. */
export type Backup = {
  version: 1;
  exportedAt: string;
  records: DiaryRecord[];
  profile: Profile;
};

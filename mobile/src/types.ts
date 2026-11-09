export type DiaryRecord = {
  id: string;
  /** 'YYYY-MM-DD' (기기의 현지 날짜) */
  date: string;
  /** EMOTIONS 배열의 인덱스 */
  emotion: number;
  title: string;
  body: string;
  /** 사진 주소. 앱에서는 파일 URI, 웹 백업에서는 data URI일 수 있습니다. */
  photos: string[];
  /** 첫 실행 때 보여주는 예시 기록 */
  sample?: boolean;
};

export type Profile = {
  name: string;
  /** 'HH:mm' 또는 알림을 끈 경우 null */
  reminder: string | null;
};

export type StatPeriod = 'week' | 'month' | 'year';

/** 웹앱(app.js)이 내보내는 백업 형식과 같습니다. 웹 백업도 앱에서 복원할 수 있습니다. */
export type Backup = {
  version: 1;
  exportedAt: string;
  records: DiaryRecord[];
  profile: Profile;
};

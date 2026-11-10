export type Emotion = {
  /** 저장되는 값: 기록의 emotion 필드는 이 배열의 인덱스입니다. */
  name: string;
  color: string;
  soft: string;
  title: string;
  hint: string;
};

/** '기타' 감정의 인덱스. 이 감정만 이름을 직접 적을 수 있습니다. */
export const OTHER_EMOTION = 8;
export const MAX_CUSTOM_EMOTION_LENGTH = 8;

// 웹앱(app.js)의 감정 9종과 순서·색을 그대로 유지합니다. 순서를 바꾸면 기존 기록이 달라집니다.
export const EMOTIONS: readonly Emotion[] = [
  { name: '행복', color: '#ffdc7d', soft: '#fff5d9', title: '행복한 하루', hint: '오늘의 작은 행복을 남겨요.' },
  { name: '설렘', color: '#f6afce', soft: '#fff0f6', title: '설레는 하루', hint: '두근거리는 순간을 남겨요.' },
  { name: '평온', color: '#a1d9cd', soft: '#eaf8f3', title: '평온한 하루', hint: '마음에 찾아온 여유를 남겨요.' },
  { name: '슬픔', color: '#a9cef3', soft: '#edf5ff', title: '슬픈 하루', hint: '어떤 마음이든 여기에 괜찮아요.' },
  { name: '화남', color: '#f2a1a5', soft: '#fff0f0', title: '화가 난 하루', hint: '천천히 마음을 풀어보세요.' },
  { name: '불안', color: '#c8b5e9', soft: '#f1ebfa', title: '불안한 하루', hint: '지금의 마음을 가만히 안아주세요.' },
  { name: '피곤', color: '#c3bdd6', soft: '#f1eff7', title: '피곤한 하루', hint: '오늘도 수고한 나에게 쉬는 시간을.' },
  { name: '우울', color: '#aaa9dc', soft: '#efeffb', title: '우울한 하루', hint: '혼자 담아두지 않아도 괜찮아요.' },
  { name: '기타', color: '#d7bde9', soft: '#f4ebfa', title: '오늘의 하루', hint: '이름을 붙이기 어려운 마음도 괜찮아요.' },
];

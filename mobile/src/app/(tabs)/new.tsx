import { Redirect } from 'expo-router';

// 가운데 + 버튼은 탭 화면이 아니라 감정 선택 화면을 엽니다. (_layout의 tabBarButton 참고)
export default function New() {
  return <Redirect href="/emotion" />;
}

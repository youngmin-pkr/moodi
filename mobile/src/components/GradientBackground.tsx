import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** 은은한 보라→분홍 그라데이션 배경. 부모 안에서 화면 전체를 채웁니다. */
export function GradientBackground() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ecdfff" />
          <Stop offset="0.5" stopColor="#faf6ff" />
          <Stop offset="1" stopColor="#fbe5f1" />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#bg)" />
    </Svg>
  );
}

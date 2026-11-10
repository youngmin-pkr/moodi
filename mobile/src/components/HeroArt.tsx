import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

const STAR = 'M0-7 L1.8-1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8-1.8Z';

/** 홈 소개 카드의 배경 일러스트: 노을빛 방 안, 창에서 드는 빛, 식물과 책, 구름 베개. */
export function HeroArt() {
  // 부모에 안쪽 여백(padding)이 있으면 Svg에 준 "100%"가 여백을 뺀 크기가 되어 그림이 작아집니다.
  // 여백이 없는 래퍼 View가 카드 전체를 채우고, Svg는 그 래퍼를 채우게 합니다.
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 340 230" preserveAspectRatio="xMidYMid slice" accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#5f43b8" />
          <Stop offset="0.55" stopColor="#8266d3" />
          <Stop offset="1" stopColor="#b9a0f0" />
        </LinearGradient>
        <RadialGradient id="glow" cx="0.82" cy="0.18" rx="0.7" ry="0.8">
          <Stop offset="0" stopColor="#f3eaff" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#f3eaff" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="340" height="230" fill="url(#sky)" />
      <Rect width="340" height="230" fill="url(#glow)" />

      {/* 창에서 비스듬히 들어오는 빛 */}
      <Path d="M214 0 H300 L250 230 H150 Z" fill="url(#beam)" />
      <Path d="M262 0 H320 L300 160 H236 Z" fill="#ffffff" opacity={0.07} />

      {/* 반짝이 */}
      <G fill="#ffffff">
        <Path d={STAR} transform="translate(178 38) scale(0.9)" opacity={0.7} />
        <Path d={STAR} transform="translate(232 18) scale(0.6)" opacity={0.55} />
        <Path d={STAR} transform="translate(300 96) scale(0.7)" opacity={0.6} />
        <Circle cx="156" cy="20" r="1.6" opacity={0.6} />
        <Circle cx="206" cy="64" r="1.2" opacity={0.5} />
        <Circle cx="320" cy="40" r="1.4" opacity={0.5} />
      </G>

      {/* 식물 */}
      <G opacity={0.5} fill="#43308f" stroke="#43308f">
        <Path d="M306 196 Q300 160 310 124" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M304 170 Q282 160 278 140 Q300 142 304 170Z" strokeWidth="0" />
        <Path d="M308 150 Q330 142 334 120 Q312 122 308 150Z" strokeWidth="0" />
        <Path d="M309 130 Q298 112 304 96 Q318 112 309 130Z" strokeWidth="0" />
        <Path d="M292 196 H322 L318 218 H296Z" strokeWidth="0" opacity={0.9} />
      </G>

      {/* 책 */}
      <G>
        <Rect x="212" y="196" width="56" height="11" rx="2" fill="#4a3597" opacity={0.55} />
        <Rect x="218" y="186" width="46" height="10" rx="2" fill="#e9defc" opacity={0.5} />
      </G>

      {/* 구름 베개(언덕) */}
      <Path d="M0 186 Q50 150 120 176 T250 172 T340 160 V230 H0Z" fill="#a78ee9" opacity={0.6} />
      <Path d="M0 206 Q90 172 170 200 T340 190 V230 H0Z" fill="#c6b4f4" opacity={0.75} />
      <Ellipse cx="58" cy="214" rx="64" ry="14" fill="#d9ccfa" opacity={0.5} />
    </Svg>
    </View>
  );
}

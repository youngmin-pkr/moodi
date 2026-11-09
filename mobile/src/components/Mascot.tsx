import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { EMOTIONS } from '../constants/emotions';

const BODY =
  'M28 85C10 85 6 67 17 57 8 41 21 21 38 25 47 5 70 7 77 26 99 22 110 42 101 57 117 71 105 91 89 89 72 103 46 102 28 85Z';

/** 시그니처 구름 캐릭터. emotion 인덱스에 따라 색과 표정이 달라집니다. (웹앱 mascot()을 옮김) */
export function Mascot({ emotion = 8, size = 120 }: { emotion?: number; size?: number }) {
  const i = emotion;
  const c = EMOTIONS[i].color;
  const eyes =
    i === 0 ? (
      <Path d="M39 47q5-8 10 0m22 0q5-8 10 0" />
    ) : i === 2 || i === 6 ? (
      <Path d="M39 48q5 5 10 0m22 0q5 5 10 0" />
    ) : (
      <>
        <Circle cx={44} cy={47} r={3} fill="#514364" />
        <Circle cx={76} cy={47} r={3} fill="#514364" />
      </>
    );
  const mouth =
    i === 0 || i === 1 ? (
      <Path d="M52 58q8 12 16 0Z" fill="#87617e" />
    ) : i === 3 || i === 5 || i === 7 ? (
      <Path d="M53 63q7-9 14 0" />
    ) : (
      <Path d="M55 61h10" />
    );
  return (
    <Svg width={size} height={size * (110 / 120)} viewBox="0 0 120 110" accessibilityLabel={`${EMOTIONS[i].name} 구름`}>
      <Defs>
        <LinearGradient id={`g${i}`} x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#fff" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={60} cy={100} rx={35} ry={5} fill={c} opacity={0.18} />
      <Path d={BODY} fill={c} />
      <Path d={BODY} fill={`url(#g${i})`} />
      <Ellipse cx={34} cy={60} rx={9} ry={5} fill="#eda4c0" opacity={0.65} />
      <Ellipse cx={86} cy={60} rx={9} ry={5} fill="#eda4c0" opacity={0.65} />
      <G stroke="#514364" strokeWidth={2.5} strokeLinecap="round" fill="none">
        {eyes}
        {mouth}
      </G>
      <Ellipse cx={38} cy={91} rx={10} ry={6} fill={c} />
      <Ellipse cx={83} cy={91} rx={10} ry={6} fill={c} />
      {i === 1 && (
        <SvgText x={91} y={20} fill="#df72a4" fontSize={20}>
          ♥
        </SvgText>
      )}
      {i === 3 && <Path d="M89 51q-10 15 0 15t0-15" fill="#70acde" />}
      {i === 6 && (
        <SvgText x={88} y={26} fill="#80778e" fontSize={13}>
          z
        </SvgText>
      )}
      {i === 4 && <Path d="m39 36 10 5m22 0 10-5" stroke="#80526a" strokeWidth={3} />}
    </Svg>
  );
}

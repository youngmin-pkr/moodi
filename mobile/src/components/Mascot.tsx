import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { EMOTIONS } from '../constants/emotions';

const BODY =
  'M28 85C10 85 6 67 17 57 8 41 21 21 38 25 47 5 70 7 77 26 99 22 110 42 101 57 117 71 105 91 89 89 72 103 46 102 28 85Z';

/** 시그니처 구름 캐릭터. emotion 인덱스에 따라 색과 표정이 달라집니다. (웹앱 mascot()을 옮김) */
/** emotion을 주면 그 감정의 표정, 주지 않으면 브랜드 구름(무표정)입니다. */
export function Mascot({ emotion, size = 120 }: { emotion?: number; size?: number }) {
  const i = emotion ?? 8;
  const brand = emotion === undefined;
  const c = EMOTIONS[i].color;
  const eyes =
    i === 0 ? (
      <Path d="M39 47q5-8 10 0m22 0q5-8 10 0" />
    ) : i === 2 || i === 6 ? (
      <>
        <Path d="M39 48q5 5 10 0m22 0q5 5 10 0" />
        {i === 6 && <Path d="M40 55q4 2.5 8 0M72 55q4 2.5 8 0" strokeWidth={1.6} opacity={0.45} />}
      </>
    ) : (
      <>
        <Circle cx={44} cy={47} r={3} fill="#514364" />
        <Circle cx={76} cy={47} r={3} fill="#514364" />
        {i === 5 && <Path d="M37 41l12-5M71 36l12 5" strokeWidth={2} />}
        {i === 7 && <Path d="M38 42.5h12M70 42.5h12" strokeWidth={2.2} />}
      </>
    );
  const mouth =
    i === 0 || i === 1 ? (
      <Path d="M52 58q8 12 16 0Z" fill="#87617e" />
    ) : i === 5 ? (
      <Path d="M50 62q4-5 7.5 0t7.5 0 5 0" />
    ) : i === 3 || i === 7 ? (
      <Path d="M53 63q7-9 14 0" />
    ) : i === 8 && !brand ? (
      <Circle cx={60} cy={62} r={3} />
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
      {i === 5 && <Path d="M95 30q-6 9 0 13t0-13" fill="#8cc6f0" />}
      {i === 7 && (
        <G fill="#8b84a6">
          <Circle cx={92} cy={30} r={2.2} />
          <Circle cx={99} cy={24} r={2.8} />
          <Circle cx={107} cy={16} r={3.4} />
        </G>
      )}
      {i === 8 && !brand && (
        <SvgText x={90} y={26} fill="#8b7bb5" fontSize={20} fontWeight="bold">
          ?
        </SvgText>
      )}
    </Svg>
  );
}

import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { EMOTIONS } from '../constants/emotions';
import { darken, lighten } from '../lib/color';

const BODY =
  'M28 85C10 85 6 67 17 57 8 41 21 21 38 25 47 5 70 7 77 26 99 22 110 42 101 57 117 71 105 91 89 89 72 103 46 102 28 85Z';

/**
 * 시그니처 구름 캐릭터. 감정에 따라 색과 표정이 달라지고, 위는 밝고 아래는 짙은 음영과
 * 하이라이트로 입체감을 줍니다. emotion을 주지 않으면 브랜드 구름(무표정)입니다.
 * blink가 true이면 눈을 감습니다(깜빡임 애니메이션용).
 */
export function Mascot({ emotion, size = 120, blink = false }: { emotion?: number; size?: number; blink?: boolean }) {
  const i = emotion ?? 8;
  const brand = emotion === undefined;
  const c = EMOTIONS[i].color;
  const top = lighten(c, 0.6);
  const mid = lighten(c, 0.1);
  const bottom = darken(c, 0.32);
  const shade = darken(c, 0.62);

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
        {blink ? (
          <Path d="M40.5 47.5h7M72.5 47.5h7" strokeWidth={2.6} />
        ) : (
          <>
            <Circle cx={44} cy={47} r={3.4} fill="#514364" stroke="none" />
            <Circle cx={76} cy={47} r={3.4} fill="#514364" stroke="none" />
            {/* 눈에 빛 점을 찍어 반짝이는 눈으로 */}
            <Circle cx={45.2} cy={45.7} r={1.2} fill="#fff" stroke="none" />
            <Circle cx={77.2} cy={45.7} r={1.2} fill="#fff" stroke="none" />
          </>
        )}
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
        {/* 몸통: 왼쪽 위에서 오른쪽 아래로 밝음 → 어두움 */}
        <LinearGradient id={`body${i}`} x1="0.15" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="0.5" stopColor={mid} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
        {/* 아래쪽 면에 깔리는 그림자 */}
        <LinearGradient id={`form${i}`} x1="0.5" y1="0.35" x2="0.5" y2="1">
          <Stop offset="0" stopColor={shade} stopOpacity={0} />
          <Stop offset="1" stopColor={shade} stopOpacity={0.3} />
        </LinearGradient>
        <RadialGradient id="cheek" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#f78fb5" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#f78fb5" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`floor${i}`} cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor={shade} stopOpacity={0.4} />
          <Stop offset="1" stopColor={shade} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`foot${i}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={mid} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>

      {/* 바닥에 드리운 그림자 */}
      <Ellipse cx={60} cy={101} rx={40} ry={6.5} fill={`url(#floor${i})`} />

      {/* 몸통 + 음영 */}
      <Path d={BODY} fill={`url(#body${i})`} />
      <Path d={BODY} fill={`url(#form${i})`} />

      {/* 하이라이트: 왼쪽 위에서 빛이 비치는 느낌 */}
      <Ellipse cx={39} cy={31} rx={15} ry={8} fill="#fff" opacity={0.46} transform="rotate(-28 39 31)" />
      <Circle cx={60} cy={21} r={3} fill="#fff" opacity={0.6} />
      <Circle cx={24} cy={44} r={1.8} fill="#fff" opacity={0.45} />

      {/* 볼터치 */}
      <Ellipse cx={34} cy={60} rx={11} ry={6.5} fill="url(#cheek)" />
      <Ellipse cx={86} cy={60} rx={11} ry={6.5} fill="url(#cheek)" />

      <G stroke="#514364" strokeWidth={2.5} strokeLinecap="round" fill="none">
        {eyes}
        {mouth}
      </G>

      {/* 발 */}
      <Ellipse cx={38} cy={91} rx={10} ry={6} fill={`url(#foot${i})`} />
      <Ellipse cx={83} cy={91} rx={10} ry={6} fill={`url(#foot${i})`} />
      <Ellipse cx={35} cy={88.5} rx={4.5} ry={1.8} fill="#fff" opacity={0.4} />
      <Ellipse cx={80} cy={88.5} rx={4.5} ry={1.8} fill="#fff" opacity={0.4} />

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

import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Mascot } from './Mascot';
import { EMOTIONS } from '../constants/emotions';
import { lighten } from '../lib/color';
import { useReduceMotion } from '../lib/useReduceMotion';

const STAR = 'M0-7 L1.8-1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8-1.8Z';

type Reaction = 'hop' | 'wiggle' | 'sway' | 'droop' | 'shake' | 'tremble' | 'spin';
// 감정(EMOTIONS 순서)마다 다르게 반응합니다. 감정이 없는 브랜드 구름은 폴짝 뜁니다.
const REACTIONS: readonly Reaction[] = ['hop', 'wiggle', 'sway', 'droop', 'shake', 'tremble', 'droop', 'droop', 'spin'];

type Vals = { tx: Animated.Value; ty: Animated.Value; rot: Animated.Value; sx: Animated.Value; sy: Animated.Value };

const timing = (v: Animated.Value, to: number, duration: number, easing?: (t: number) => number) =>
  Animated.timing(v, { toValue: to, duration, easing, useNativeDriver: true });
const spring = (v: Animated.Value, to: number) => Animated.spring(v, { toValue: to, friction: 3.2, tension: 190, useNativeDriver: true });

/** 반응 애니메이션을 만듭니다. size에 비례해 움직여서 큰 구름도 작은 구름도 비슷하게 보입니다. */
function reaction(kind: Reaction, v: Vals, size: number): Animated.CompositeAnimation {
  const u = size / 72;
  const settle = Animated.parallel([spring(v.sx, 1), spring(v.sy, 1), spring(v.ty, 0), spring(v.tx, 0)]);
  switch (kind) {
    case 'hop':
      return Animated.sequence([
        Animated.parallel([timing(v.sy, 0.86, 110), timing(v.sx, 1.1, 110)]), // 웅크렸다가
        Animated.parallel([timing(v.ty, -18 * u, 190, Easing.out(Easing.quad)), timing(v.sy, 1.12, 190), timing(v.sx, 0.92, 190)]), // 폴짝
        Animated.parallel([timing(v.ty, 0, 170, Easing.in(Easing.quad)), timing(v.sy, 0.94, 170), timing(v.sx, 1.05, 170)]), // 착지
        settle,
      ]);
    case 'wiggle':
      return Animated.sequence([
        Animated.parallel([timing(v.ty, -6 * u, 120), timing(v.rot, -10, 120)]),
        timing(v.rot, 10, 130),
        timing(v.rot, -7, 120),
        timing(v.rot, 7, 120),
        Animated.parallel([timing(v.rot, 0, 140), timing(v.ty, 0, 140)]),
      ]);
    case 'sway':
      return Animated.sequence([timing(v.rot, 5, 300), timing(v.rot, -5, 420), timing(v.rot, 3, 360), timing(v.rot, 0, 300)]);
    case 'droop':
      return Animated.sequence([Animated.parallel([timing(v.sy, 0.88, 380), timing(v.sx, 1.06, 380), timing(v.ty, 4 * u, 380)]), Animated.delay(260), settle]);
    case 'shake':
      return Animated.sequence([-7, 7, -6, 6, -3, 3, 0].map((x) => timing(v.tx, x * u, 55)));
    case 'tremble':
      return Animated.sequence([...Array.from({ length: 12 }, (_, i) => timing(v.tx, (i % 2 ? 2 : -2) * u, 32)), timing(v.tx, 0, 40)]);
    case 'spin':
      return Animated.sequence([
        Animated.parallel([timing(v.rot, 360, 650, Easing.out(Easing.cubic)), timing(v.ty, -12 * u, 280), timing(v.sy, 1.06, 280)]),
        Animated.parallel([timing(v.ty, 0, 260), timing(v.sy, 1, 260)]),
      ]);
  }
}

type Props = {
  emotion?: number;
  size?: number;
  /** true이면 둥실 떠 있고, 숨 쉬고, 눈을 깜빡입니다. */
  idle?: boolean;
  /** 이 값이 바뀔 때마다(0보다 클 때) 감정에 맞는 반응을 한 번 합니다. */
  reactKey?: number;
  /** 구름 뒤에서 은은하게 반짝이는 빛 */
  halo?: boolean;
  /** 주변에서 깜빡이는 별 */
  sparkles?: boolean;
  /** 별 색. 어두운 배경에서는 흰색을 쓰세요. */
  sparkleColor?: string;
};

/**
 * 움직이는 구름. 목록처럼 여러 개가 보이는 곳에는 쓰지 말고 주인공 구름에만 쓰세요.
 * 휴대폰의 "동작 줄이기"가 켜져 있으면 움직이지 않는 구름을 보여 줍니다.
 */
export function AnimatedMascot({ emotion, size = 120, idle = true, reactKey = 0, halo = true, sparkles = true, sparkleColor = '#b69bdf' }: Props) {
  const reduce = useReduceMotion();
  const motion = !reduce;
  const live = motion && idle;
  const [float] = useState(() => new Animated.Value(0));
  const [breathe] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const [vals] = useState<Vals>(() => ({ tx: new Animated.Value(0), ty: new Animated.Value(0), rot: new Animated.Value(0), sx: new Animated.Value(1), sy: new Animated.Value(1) }));
  const [stars] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));
  const [blink, setBlink] = useState(false);

  // 평소 움직임: 둥실, 숨쉬기, 빛 번짐, 별 반짝임
  useEffect(() => {
    if (!live) return;
    const loop = (v: Animated.Value, ms: number) =>
      Animated.loop(Animated.sequence([timing(v, 1, ms, Easing.inOut(Easing.sin)), timing(v, 0, ms, Easing.inOut(Easing.sin))]));
    const anims = [loop(float, 1700), loop(breathe, 1200), loop(pulse, 1500)];
    const starAnims = stars.map((s, i) =>
      Animated.loop(Animated.sequence([Animated.delay(i * 520), timing(s, 1, 480, Easing.out(Easing.quad)), timing(s, 0, 760, Easing.in(Easing.quad)), Animated.delay(500 + i * 200)])),
    );
    [...anims, ...starAnims].forEach((a) => a.start());
    return () => [...anims, ...starAnims].forEach((a) => a.stop());
  }, [live, float, breathe, pulse, stars]);

  // 가끔 눈 깜빡임
  useEffect(() => {
    if (!live) return;
    let alive = true;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      t1 = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        t2 = setTimeout(() => {
          if (!alive) return;
          setBlink(false);
          schedule();
        }, 140);
      }, 2600 + Math.random() * 2800);
    };
    schedule();
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [live]);

  // 반응: reactKey가 바뀔 때마다 한 번
  useEffect(() => {
    if (!motion || reactKey <= 0) return;
    const kind = emotion === undefined ? 'hop' : (REACTIONS[emotion] ?? 'hop');
    vals.tx.setValue(0);
    vals.ty.setValue(0);
    vals.rot.setValue(0);
    vals.sx.setValue(1);
    vals.sy.setValue(1);
    const anim = reaction(kind, vals, size);
    anim.start(({ finished }) => {
      if (finished) vals.rot.setValue(0); // 360도 회전 뒤 0도로 되돌립니다(눈에 보이는 변화 없음)
    });
    return () => anim.stop();
  }, [reactKey, motion, emotion, size, vals]);

  if (reduce) return <Mascot emotion={emotion} size={size} />;

  const h = size * (110 / 120);
  const color = lighten(EMOTIONS[emotion ?? 8].color, 0.25);
  const bob = float.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.045] });
  const sxIdle = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });
  const syIdle = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const rotate = vals.rot.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.1] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] });
  const spots = [
    { left: -size * 0.06, top: h * 0.06, k: 1 },
    { left: size * 0.92, top: h * 0.16, k: 0.8 },
    { left: size * 0.84, top: h * 0.72, k: 0.62 },
  ];

  return (
    <View style={{ width: size, height: h }}>
      {halo && live && (
        <Animated.View pointerEvents="none" style={[styles.halo, { width: size * 1.7, height: size * 1.7, left: -size * 0.35, top: -size * 0.45, opacity: haloOpacity, transform: [{ scale: haloScale }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="halo" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={color} stopOpacity={0.75} />
                <Stop offset="0.55" stopColor={color} stopOpacity={0.25} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#halo)" />
          </Svg>
        </Animated.View>
      )}

      {/* 바깥: 둥실·숨쉬기 / 안쪽: 감정 반응 */}
      <Animated.View style={{ transform: [{ translateY: bob }, { scaleX: sxIdle }, { scaleY: syIdle }] }}>
        <Animated.View style={{ transform: [{ translateX: vals.tx }, { translateY: vals.ty }, { rotate }, { scaleX: vals.sx }, { scaleY: vals.sy }] }}>
          <Mascot emotion={emotion} size={size} blink={live && blink} />
        </Animated.View>
      </Animated.View>

      {sparkles &&
        live &&
        spots.map((p, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{ position: 'absolute', left: p.left, top: p.top, opacity: stars[i], transform: [{ scale: stars[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, p.k] }) }, { rotate: stars[i].interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '15deg'] }) }] }}
          >
            <Svg width={size * 0.2} height={size * 0.2} viewBox="-8 -8 16 16">
              <Path d={STAR} fill={sparkleColor} />
            </Svg>
          </Animated.View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute' },
});

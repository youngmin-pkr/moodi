import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** 휴대폰의 "동작 줄이기" 설정이 켜져 있으면 true. 켜져 있으면 장식용 움직임을 끕니다. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduce(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

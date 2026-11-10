const parse = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
};

const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

/** hex 색을 다른 색 쪽으로 t(0~1)만큼 섞습니다. 예: mix('#ff0000', '#ffffff', 0.5) → 더 밝은 빨강 */
export function mix(hex: string, other: string, t: number): string {
  const a = parse(hex);
  const b = parse(other);
  return '#' + a.map((v, i) => toHex(v + (b[i] - v) * t)).join('');
}

export const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t);
// 그림자 색은 검정이 아니라 보라 쪽으로 섞어야 노랑 같은 밝은 색이 탁해지지 않습니다.
export const darken = (hex: string, t: number) => mix(hex, '#8a52c8', t);

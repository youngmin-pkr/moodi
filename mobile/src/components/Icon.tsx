import Svg, { Path } from 'react-native-svg';

// 웹앱(app.js)의 24x24 아이콘 경로를 그대로 사용합니다.
const PATHS = {
  home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3z',
  record: 'M6 3h13v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm1 5h8M7 12h6M7 17h8',
  stats: 'M4 20h16M6 16V9m6 7V4m6 12v-5',
  profile: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  plus: 'M12 4v16M4 12h16',
  back: 'm15 4-8 8 8 8',
  next: 'm9 4 8 8-8 8',
  search: 'M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  bell: 'M5 16h14l-2-3V8a5 5 0 0 0-10 0v5Zm5 4h4',
  photo: 'M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M16 7h.01',
  camera: 'M3 7h4l2-3h6l2 3h4v14H3ZM8 13a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16',
  lock: 'M5 10h14v12H5ZM8 10V6a4 4 0 0 1 8 0v4m-4 4v4',
  edit: 'm4 16 12-12 4 4L8 20H4Zm10-10 4 4',
  trash: 'M4 6h16M9 3h6M7 6l1 15h8l1-15M10 10v7m4-7v7',
  close: 'M6 6l12 12M18 6 6 18',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, color = '#3f3556' }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={PATHS[name]} />
    </Svg>
  );
}

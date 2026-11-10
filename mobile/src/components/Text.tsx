import { StyleSheet, Text as RNText, TextInput as RNTextInput, type StyleProp, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { fontFamilyForWeight } from '../constants/theme';

/**
 * fontWeight를 Pretendard 파일(Regular/Medium/Bold)로 바꿔 줍니다.
 * - 사용자 지정 글꼴은 fontWeight로 굵기가 골라지지 않고, 안드로이드에서는 굵기가 겹쳐 적용되기도 해서 직접 고릅니다.
 * - style에 fontFamily가 이미 있으면(로고 등) 그대로 둡니다.
 * - style이 없는 중첩 Text는 부모 글꼴을 이어받도록 건드리지 않습니다.
 */
function withFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  if (style === undefined || style === null) return style;
  const flat = StyleSheet.flatten(style);
  if (!flat || flat.fontFamily) return style;
  const { fontWeight, ...rest } = flat;
  return [rest, { fontFamily: fontFamilyForWeight(fontWeight), fontWeight: 'normal' }];
}

export function Text(props: TextProps) {
  return <RNText {...props} style={withFont(props.style)} />;
}

export function TextInput(props: TextInputProps) {
  // 입력칸은 style이 없어도 앱 기본 글꼴로 보이게 합니다.
  return <RNTextInput {...props} style={withFont(props.style ?? {})} />;
}

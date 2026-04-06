/**
 * Themed primitives.
 *
 * Now that NativeWind handles dark mode via className `dark:` variants,
 * these wrappers simply apply default colors for backward compatibility
 * with components that still pass a `type` prop.
 *
 * New components can use plain RN <Text>/<View> with className directly.
 */
import { Text as DefaultText, View as DefaultView, TextStyle, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useSettingsStore } from '@/store/useSettingsStore';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const { primaryColor } = useSettingsStore();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // If it's the primary color and user has a custom one, return it
  if (colorName === 'primary' && primaryColor) {
    return primaryColor;
  }

  return Colors[theme][colorName];
}

export function Text(
  props: TextProps & {
    type?: 'default' | 'secondary' | 'tertiary' | 'primary' | 'danger';
  },
) {
  const {
    style,
    lightColor,
    darkColor,
    type = 'default',
    ...otherProps
  } = props;

  let colorName: keyof typeof Colors.light & keyof typeof Colors.dark = 'text';
  if (type === 'secondary') colorName = 'textSecondary';
  else if (type === 'tertiary') colorName = 'textTertiary';
  else if (type === 'primary') colorName = 'primary';
  else if (type === 'danger') colorName = 'danger';

  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorName,
  );

  const { fontSizeScale, lineHeightScale } = useSettingsStore();

  // 基础字号逻辑
  const baseStyle: TextStyle = { color };
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const currentFontSize = flattenedStyle.fontSize || 15; // 默认 15
  const currentLineHeight = flattenedStyle.lineHeight || currentFontSize * 1.5;

  const finalStyle: TextStyle = {
    ...flattenedStyle,
    color: flattenedStyle.color || color,
    fontSize: currentFontSize * fontSizeScale,
    lineHeight: (currentLineHeight * lineHeightScale) / 1.5, // 修正比例
  };

  return <DefaultText style={finalStyle} {...otherProps} />;
}

export function View(
  props: ViewProps & {
    type?:
      | 'default'
      | 'surface'
      | 'border'
      | 'secondary'
      | 'tertiary'
      | 'divider'
      | 'primaryTransparent';
  },
) {
  const { style, lightColor, darkColor, type, ...otherProps } = props;

  let backgroundColor: string | undefined;

  if (type) {
    let colorName: keyof typeof Colors.light & keyof typeof Colors.dark =
      'background';
    if (type === 'surface' || type === 'secondary')
      colorName = 'backgroundSecondary';
    else if (type === 'border') colorName = 'border';
    else if (type === 'tertiary') colorName = 'backgroundTertiary';
    else if (type === 'divider') colorName = 'divider';
    else if (type === 'primaryTransparent') colorName = 'primaryTransparent';

    backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      colorName,
    );
  }

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

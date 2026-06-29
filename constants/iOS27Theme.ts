/**
 * iOS 27 主题配置
 * 现代化设计，适配 iOS 27 风格
 */

export const iOS27Colors = {
  light: {
    // 基础色
    background: '#ffffff',
    surface: '#f8f8f8',
    surfaceSecondary: '#f2f2f2',

    // 文字色
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // 强调色
    accent: '#0084ff',
    accentLight: '#0084ff20',

    // 警告/错误
    destructive: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500',

    // 边框/分隔线
    border: '#e5e5e5',
    divider: 'rgba(0,0,0,0.05)',
  },

  dark: {
    // 基础色
    background: '#000000',
    surface: '#1a1a1a',
    surfaceSecondary: '#2a2a2a',

    // 文字色
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textTertiary: '#757575',

    // 强调色
    accent: '#0084ff',
    accentLight: '#0084ff30',

    // 警告/错误
    destructive: '#ff453a',
    success: '#32d74b',
    warning: '#ffa500',

    // 边框/分隔线
    border: '#333333',
    divider: 'rgba(255,255,255,0.1)',
  },
};

/**
 * iOS 27 毛玻璃配置
 */
export const iOS27BlurConfig = {
  // 轻度毛玻璃
  light: {
    intensity: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  // 中等毛玻璃
  medium: {
    intensity: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  // 深度毛玻璃
  dark: {
    intensity: 120,
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
  },
};

/**
 * iOS 27 圆角半径
 */
export const iOS27BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 32,
};

/**
 * iOS 27 间距
 */
export const iOS27Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

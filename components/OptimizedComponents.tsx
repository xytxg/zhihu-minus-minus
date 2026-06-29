import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

/**
 * 优化的卡片组件 - 采用轻量级设计
 * 避免过度复杂的嵌套和不必要的重新渲染
 */
export const OptimizedCard = React.memo(function OptimizedCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const colorScheme = useColorScheme();
  const surface = Colors[colorScheme].surface;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface },
        style,
      ]}
    >
      {children}
    </View>
  );
});

/**
 * 图片占位符组件
 */
export const ImagePlaceholder = React.memo(function ImagePlaceholder({
  width = 100,
  height = 100,
}: {
  width?: number;
  height?: number;
}) {
  const colorScheme = useColorScheme();
  const placeholderColor = Colors[colorScheme].surface;

  return (
    <View
      style={[
        styles.placeholder,
        {
          width,
          height,
          backgroundColor: placeholderColor,
        },
      ]}
    />
  );
});

/**
 * 分割线组件
 */
export const Divider = React.memo(function Divider() {
  const colorScheme = useColorScheme();
  const dividerColor = Colors[colorScheme].border;

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: dividerColor },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    elevation: Platform.OS === 'android' ? 3 : undefined,
  },
  placeholder: {
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
    marginVertical: 8,
  },
});

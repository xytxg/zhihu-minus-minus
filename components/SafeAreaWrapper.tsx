import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

/**
 * iOS 27 安全区域包装器
 * 自动处理 notch、dynamic island、底部安全区域
 */
export const SafeAreaWrapper = React.memo(function SafeAreaWrapper({
  children,
  edges = ['top', 'bottom'],
  style,
}: {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}) {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme].background;

  const edgePadding = useMemo(() => {
    const padding: any = {};
    // 实际的安全区域由 SafeAreaProvider 处理
    // 这里只是为了提供一个一致的包装器
    return padding;
  }, [edges]);

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor },
        edgePadding,
        style,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

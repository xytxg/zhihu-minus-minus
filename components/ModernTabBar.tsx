import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface TabBarItem {
  name: string;
  icon: string;
  activeIcon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

interface ModernTabBarProps {
  items: TabBarItem[];
  scrollX: Animated.SharedValue<number>;
  containerWidth: number;
  style?: ViewStyle;
}

/**
 * iOS 27 风格现代化标签栏
 * - 毛玻璃效果背景
 * - 平滑的指示器动画
 * - 性能优化的图标渲染
 */
export const ModernTabBar = React.memo(
  ({ items, scrollX, containerWidth, style }: ModernTabBarProps) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const { width: windowWidth } = useWindowDimensions();
    const tintColor = Colors[colorScheme].tint;
    const textSecondary = Colors[colorScheme].textSecondary;

    const homeTabsCount = useMemo(() => {
      return items.filter((t) => !['publish', 'profile'].includes(t.name))
        .length;
    }, [items]);

    const bottomIndicatorStyle = useAnimatedStyle(() => {
      const hasPublish = items.some((t) => t.name === 'publish');
      const hasProfile = items.some((t) => t.name === 'profile');
      const totalBottomIcons =
        (homeTabsCount > 0 ? 1 : 0) + (hasPublish ? 1 : 0) + (hasProfile ? 1 : 0);
      const iconWidth = containerWidth / (totalBottomIcons || 1);

      const inputRange: number[] = [];
      const outputRange: number[] = [];

      if (homeTabsCount > 0) {
        inputRange.push(0, homeTabsCount - 1);
        outputRange.push(0, 0);
      }

      if (hasPublish) {
        const publishIdx = items.findIndex((t) => t.name === 'publish');
        const bottomIdx = homeTabsCount > 0 ? 1 : 0;
        inputRange.push(publishIdx);
        outputRange.push(bottomIdx * iconWidth);
      }

      if (hasProfile) {
        const profileIdx = items.findIndex((t) => t.name === 'profile');
        const bottomIdx = (homeTabsCount > 0 ? 1 : 0) + (hasPublish ? 1 : 0);
        inputRange.push(profileIdx);
        outputRange.push(bottomIdx * iconWidth);
      }

      const translateX = interpolate(
        scrollX.value,
        inputRange.length > 1 ? inputRange : [0, 1],
        outputRange.length > 1 ? outputRange : [0, 0],
        Extrapolate.CLAMP,
      );

      return {
        transform: [{ translateX }],
      };
    });

    return (
      <View
        style={[
          styles.bottomBarContainer,
          { bottom: insets.bottom, width: containerWidth },
          style,
        ]}
      >
        <BlurView
          intensity={100}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={[
            styles.bottomBlur,
            {
              backgroundColor:
                colorScheme === 'dark'
                  ? 'rgba(15, 15, 15, 0.75)'
                  : 'rgba(255, 255, 255, 0.9)',
            },
          ]}
        >
          <View style={styles.bottomNavItems}>
            {/* 指示器 */}
            <Animated.View
              style={[
                styles.bottomIndicator,
                {
                  backgroundColor: `${tintColor}10`,
                  width:
                    containerWidth /
                      (items.filter(
                        (t) => !['publish', 'profile'].includes(t.name),
                      ).length > 0
                        ? items.filter(
                            (t) => !['publish', 'profile'].includes(t.name),
                          ).length +
                          (items.some((t) => t.name === 'publish') ? 1 : 0) +
                          (items.some((t) => t.name === 'profile') ? 1 : 0)
                        : 1) -
                    16,
                },
                bottomIndicatorStyle,
              ]}
            />

            {/* 标签项 */}
            {items.map((item) => (
              <TabBarIconItem
                key={item.name}
                item={item}
                tintColor={tintColor}
                textSecondary={textSecondary}
              />
            ))}
          </View>
        </BlurView>
      </View>
    );
  },
);

ModernTabBar.displayName = 'ModernTabBar';

interface TabBarIconItemProps {
  item: TabBarItem;
  tintColor: string;
  textSecondary: string;
}

const TabBarIconItem = React.memo(function TabBarIconItem({
  item,
  tintColor,
  textSecondary,
}: TabBarIconItemProps) {
  return (
    <Pressable
      onPress={item.onPress}
      style={styles.bottomTabItem}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 28 }}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.isActive ? item.activeIcon : item.icon}
          size={item.isActive ? 26 : 24}
          color={item.isActive ? tintColor : textSecondary}
        />
      </View>
      {item.label && (
        <Text
          style={[
            styles.tabLabel,
            {
              color: item.isActive ? tintColor : textSecondary,
            },
          ]}
        >
          {item.label}
        </Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1001,
    borderRadius: 32,
    overflow: 'hidden',
  },
  bottomBlur: {
    borderRadius: 32,
    overflow: 'hidden',
    height: 64,
    borderWidth: 0.5,
    borderColor: 'rgba(200, 200, 200, 0.2)',
  },
  bottomNavItems: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  bottomTabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  bottomIndicator: {
    position: 'absolute',
    height: 44,
    borderRadius: 22,
    left: 8,
  },
});

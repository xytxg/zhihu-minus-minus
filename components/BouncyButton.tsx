import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useCallback } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BouncyButtonProps extends PressableProps {
  children: React.ReactNode;
  activeScale?: number;
  activeOpacity?: number;
  hapticFeedback?: boolean;
  className?: string; // For NativeWind support
  style?: StyleProp<ViewStyle>;
}

export function BouncyButton({
  children,
  activeScale = 0.98,
  activeOpacity = 0.82,
  hapticFeedback = true,
  style,
  onPressIn,
  onPressOut,
  ...props
}: BouncyButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = useCallback(
    (e: any) => {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      scale.value = withSpring(activeScale, { damping: 35, stiffness: 800 });
      opacity.value = withTiming(activeOpacity, { duration: 50 });
      if (onPressIn) onPressIn(e);
    },
    [activeScale, activeOpacity, hapticFeedback, onPressIn, scale, opacity],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, { damping: 35, stiffness: 800 });
      opacity.value = withTiming(1, { duration: 100 });
      if (onPressOut) onPressOut(e);
    },
    [onPressOut, scale, opacity],
  );

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

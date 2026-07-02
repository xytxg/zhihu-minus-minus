import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GradientMaskOverlay({ isDark }: { isDark: boolean }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {insets.top > 0 && (
        <MaskedView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top + 30,
            zIndex: 999,
          }}
          maskElement={
            <LinearGradient
              colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
              style={{ flex: 1 }}
            />
          }
        >
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flex: 1,
              backgroundColor: isDark
                ? 'rgba(26,26,26,0.2)'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        </MaskedView>
      )}
      {insets.bottom > 0 && (
        <MaskedView
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom + 30,
            zIndex: 999,
          }}
          maskElement={
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
              style={{ flex: 1 }}
            />
          }
        >
          <BlurView
            intensity={100}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flex: 1,
              backgroundColor: isDark
                ? 'rgba(26,26,26,0.2)'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        </MaskedView>
      )}
    </View>
  );
}

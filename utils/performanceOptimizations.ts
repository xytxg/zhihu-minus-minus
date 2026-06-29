import { Platform } from 'react-native';

/**
 * 性能优化配置
 */

export const LIST_PERFORMANCE_CONFIG = {
  // FlashList 配置
  estimatedItemSize: 100,
  overrideItemLayout: (layout: any, item: any) => {
    if (item.type === 'large') {
      layout.size = 200;
    } else if (item.type === 'small') {
      layout.size = 50;
    }
  },
  // 根据平台优化
  maxToRenderPerBatch: Platform.OS === 'ios' ? 15 : 10,
  initialNumToRender: Platform.OS === 'ios' ? 10 : 8,
  updateCellsBatchingPeriod: Platform.OS === 'ios' ? 50 : 30,
  scrollEventThrottle: 16,
};

/**
 * 图片缓存配置
 */
export const IMAGE_CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24小时
  maxSize: 50 * 1024 * 1024, // 50MB
};

/**
 * 内存管理
 */
export const clearMemoryCache = async () => {
  try {
    // 清除不需要的缓存
    if (Platform.OS === 'ios') {
      // iOS 特定的内存清理
    }
  } catch (e) {
    console.warn('Failed to clear memory cache:', e);
  }
};

/**
 * 防止内存泄漏的工具函数
 */
export const createCleanupTracker = () => {
  const subscriptions: Array<{ unsubscribe: () => void }> = [];

  return {
    track: (subscription: { unsubscribe: () => void }) => {
      subscriptions.push(subscription);
      return subscription;
    },
    cleanup: () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
      subscriptions.length = 0;
    },
  };
};

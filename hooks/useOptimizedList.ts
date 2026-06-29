import { useCallback, useMemo, useRef } from 'react';
import type { FlatListProps } from 'react-native';

/**
 * 优化列表性能的 Hook
 * - 防止不必要的重新渲染
 * - 优化滚动性能
 * - 管理内存
 */
export const useOptimizedList = <T extends any>(
  data: T[],
  keyExtractor: (item: T, index: number) => string,
) => {
  const memoizedData = useMemo(() => {
    const seen = new Set<string>();
    return data.filter((item, index) => {
      const key = keyExtractor(item, index);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, keyExtractor]);

  const renderItemMemo = useCallback(
    (render: (item: T, index: number) => React.ReactElement) => {
      return ({ item, index }: { item: T; index: number }) =>
        render(item, index);
    },
    [],
  );

  return {
    data: memoizedData,
    renderItem: renderItemMemo,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    initialNumToRender: 10,
    updateCellsBatchingPeriod: 50,
    scrollEventThrottle: 16,
  };
};

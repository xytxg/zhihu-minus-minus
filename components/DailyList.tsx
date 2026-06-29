import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/useAuthStore';
import { LIST_PERFORMANCE_CONFIG } from '@/utils/performanceOptimizations';
import { refreshInfiniteQuery } from '@/utils/query';
import { getDailyList } from '@/api/zhihu';

interface DailyListProps {
  insets: any;
  onScroll?: (offset: number) => void;
}

export const DailyList = React.forwardRef<any, DailyListProps>(
  ({ insets, onScroll }, ref) => {
    const queryClient = useQueryClient();
    const colorScheme = useColorScheme();
    const tintColor = Colors[colorScheme].tint;
    const { cookies } = useAuthStore();

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isRefetching,
      refetch,
    } = useInfiniteQuery({
      queryKey: ['zhihu-daily'],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const data = await getDailyList(pageParam);
          return {
            items: data.stories || [],
            nextOffset: pageParam + 1,
            hasMore: !!(data.stories && data.stories.length > 0),
          };
        } catch (_e: any) {
          return { items: [], nextOffset: pageParam, hasMore: false };
        }
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextOffset : undefined,
      enabled: !!cookies,
    });

    const handleRefresh = useCallback(() => {
      return refreshInfiniteQuery(
        queryClient,
        ['zhihu-daily'],
        refetch,
      );
    }, [queryClient, refetch]);

    const flattenedData = useMemo(() => {
      const all = data?.pages.flatMap((page) => page.items) ?? [];
      const seen = new Set();
      return all.filter((item: any) => {
        const id = item?.id?.toString();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }, [data]);

    const flashListRef = useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
      scrollToOffset: (args: any) => flashListRef.current?.scrollToOffset(args),
      refresh: handleRefresh,
    }));

    return (
      <FlashList
        ref={flashListRef}
        data={flattenedData}
        keyExtractor={(item, index) =>
          `daily-${item.id?.toString() || index}-${index}`
        }
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
            progressViewOffset={insets.top + 70}
          />
        }
        onScroll={(e) => onScroll?.(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={LIST_PERFORMANCE_CONFIG.scrollEventThrottle}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: 120,
        }}
        {...LIST_PERFORMANCE_CONFIG}
        renderItem={({ item }: { item: any }) => (
          <View className="px-4 py-3 bg-transparent">
            <Text className="text-base font-medium">{item.title}</Text>
          </View>
        )}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center mt-[100px] bg-transparent">
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center mt-[100px] bg-transparent">
              <Text type="secondary">暂无内容 喵~</Text>
            </View>
          )
        }
      />
    );
  },
);

DailyList.displayName = 'DailyList';

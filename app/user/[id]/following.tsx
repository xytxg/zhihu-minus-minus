import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Dimensions } from 'react-native';
import {
  getMemberFollowing,
  getMemberFollowingColumns,
  getMemberFollowingQuestions,
  getMemberFollowingTopics,
} from '@/api/zhihu';
import { Text, useThemeColor, View } from '@/components/Themed';
import { UserCard } from '@/components/UserCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const TABS = [
  { key: 'users', title: '关注的人' },
  { key: 'columns', title: '关注的专栏' },
  { key: 'topics', title: '关注的话题' },
  { key: 'questions', title: '关注的问题' },
];

export default function FollowingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const colorScheme = useColorScheme();

  const borderColor = Colors[colorScheme].border;
  const bgSecondary = Colors[colorScheme].backgroundSecondary;
  const tint = useThemeColor({}, 'primary');
  const textSecondaryColor = Colors[colorScheme].textSecondary;

  // 1. 关注的人 Query
  const usersQuery = useInfiniteQuery({
    queryKey: ['user-following-users', id],
    queryFn: ({ pageParam = 0 }) =>
      getMemberFollowing(id as string, 20, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const nextUrl = lastPage.paging?.next;
      const match = nextUrl?.match(/offset=(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    },
    enabled: activeTab === 'users',
  });

  // 2. 关注的专栏 Query
  const columnsQuery = useInfiniteQuery({
    queryKey: ['user-following-columns', id],
    queryFn: ({ pageParam = 0 }) =>
      getMemberFollowingColumns(id as string, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const nextUrl = lastPage.paging?.next;
      const match = nextUrl?.match(/offset=(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    },
    enabled: activeTab === 'columns',
  });

  // 3. 关注的话题 Query
  const topicsQuery = useInfiniteQuery({
    queryKey: ['user-following-topics', id],
    queryFn: ({ pageParam = 0 }) =>
      getMemberFollowingTopics(id as string, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const nextUrl = lastPage.paging?.next;
      const match = nextUrl?.match(/offset=(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    },
    enabled: activeTab === 'topics',
  });

  // 4. 关注的问题 Query
  const questionsQuery = useInfiniteQuery({
    queryKey: ['user-following-questions', id],
    queryFn: ({ pageParam = 0 }) =>
      getMemberFollowingQuestions(id as string, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const nextUrl = lastPage.paging?.next;
      const match = nextUrl?.match(/offset=(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    },
    enabled: activeTab === 'questions',
  });

  const getQueryState = () => {
    switch (activeTab) {
      case 'users':
        return {
          data: usersQuery.data?.pages.flatMap((page) => page.data) || [],
          isLoading: usersQuery.isLoading,
          isFetchingNextPage: usersQuery.isFetchingNextPage,
          hasNextPage: usersQuery.hasNextPage,
          fetchNextPage: usersQuery.fetchNextPage,
          refetch: usersQuery.refetch,
          isRefetching: usersQuery.isRefetching,
        };
      case 'columns':
        return {
          data: columnsQuery.data?.pages.flatMap((page) => page.data) || [],
          isLoading: columnsQuery.isLoading,
          isFetchingNextPage: columnsQuery.isFetchingNextPage,
          hasNextPage: columnsQuery.hasNextPage,
          fetchNextPage: columnsQuery.fetchNextPage,
          refetch: columnsQuery.refetch,
          isRefetching: columnsQuery.isRefetching,
        };
      case 'topics':
        return {
          data: topicsQuery.data?.pages.flatMap((page) => page.data) || [],
          isLoading: topicsQuery.isLoading,
          isFetchingNextPage: topicsQuery.isFetchingNextPage,
          hasNextPage: topicsQuery.hasNextPage,
          fetchNextPage: topicsQuery.fetchNextPage,
          refetch: topicsQuery.refetch,
          isRefetching: topicsQuery.isRefetching,
        };
      case 'questions':
        return {
          data: questionsQuery.data?.pages.flatMap((page) => page.data) || [],
          isLoading: questionsQuery.isLoading,
          isFetchingNextPage: questionsQuery.isFetchingNextPage,
          hasNextPage: questionsQuery.hasNextPage,
          fetchNextPage: questionsQuery.fetchNextPage,
          refetch: questionsQuery.refetch,
          isRefetching: questionsQuery.isRefetching,
        };
      default:
        return {
          data: [],
          isLoading: false,
          isFetchingNextPage: false,
          hasNextPage: false,
          fetchNextPage: () => { },
          refetch: async () => { },
          isRefetching: false,
        };
    }
  };

  const {
    data: listData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = getQueryState();

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'users') {
      return <UserCard user={item} />;
    }
    if (activeTab === 'columns') {
      return (
        <Pressable
          className="flex-row items-center p-4"
          style={{ borderBottomWidth: 0.5, borderBottomColor: borderColor }}
          onPress={() => router.push(`/column/${item.id}`)}
        >
          <Image
            source={{ uri: item.image_url }}
            className="w-12 h-12 rounded-lg"
          />
          <View className="flex-1 ml-3 bg-transparent">
            <Text className="text-base font-semibold" numberOfLines={1}>
              {item.title}
            </Text>
            <Text type="secondary" className="text-[13px] mt-0.5" numberOfLines={1}>
              {item.intro || item.excerpt || '这个专栏没有简介喵'}
            </Text>
            <View className="flex-row mt-1 bg-transparent">
              <Text type="secondary" className="text-xs">
                {item.followers || 0} 关注者
              </Text>
              <Text type="secondary" className="text-xs ml-3">
                {item.articles_count || 0} 文章
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }
    if (activeTab === 'topics') {
      const topic = item.topic;
      if (!topic) return null;
      return (
        <Pressable
          className="flex-row items-center p-4"
          style={{ borderBottomWidth: 0.5, borderBottomColor: borderColor }}
          onPress={() => router.push(`/topic/${topic.id}`)}
        >
          <Image
            source={{ uri: topic.avatar_url }}
            className="w-12 h-12 rounded-lg"
          />
          <View className="flex-1 ml-3 bg-transparent">
            <Text className="text-base font-semibold" numberOfLines={1}>
              {topic.name}
            </Text>
            <Text type="secondary" className="text-[13px] mt-0.5" numberOfLines={1}>
              {topic.introduction || topic.excerpt || '这个话题没有简介喵'}
            </Text>
            <View className="flex-row mt-1 bg-transparent">
              <Text type="secondary" className="text-xs">
                {topic.followers_count || 0} 关注者
              </Text>
              <Text type="secondary" className="text-xs ml-3">
                {topic.questions_count || 0} 问题
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }
    if (activeTab === 'questions') {
      return (
        <Pressable
          className="p-4"
          style={{ borderBottomWidth: 0.5, borderBottomColor: borderColor }}
          onPress={() => router.push(`/question/${item.id}`)}
        >
          <Text className="text-base font-semibold" numberOfLines={2}>
            {item.title}
          </Text>
          <View className="flex-row mt-2 bg-transparent items-center">
            <Text type="secondary" className="text-xs">
              {item.answer_count || 0} 个回答
            </Text>
            <Text type="secondary" className="text-xs ml-3">
              {item.follower_count || 0} 人关注
            </Text>
            {item.author?.name && (
              <Text type="secondary" className="text-xs ml-auto">
                提问者: {item.author.name}
              </Text>
            )}
          </View>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: '我的关注' }} />

      {/* Tab bar */}
      <View
        className="flex-row h-11 border-b"
        style={{ borderBottomColor: borderColor }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="flex-1 justify-center items-center h-full"
            >
              <Text
                className={`text-[13px] ${isActive ? 'font-bold' : ''}`}
                style={{ color: isActive ? tint : textSecondaryColor }}
              >
                {tab.title}
              </Text>
              {isActive && (
                <View
                  className="absolute bottom-0 w-8 h-[2px] rounded-full"
                  style={{ backgroundColor: tint }}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <FlashList
        data={listData}
        renderItem={renderItem}
        estimatedItemSize={80}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={() => (
          <View className="p-[50px] items-center">
            {isLoading ? (
              <ActivityIndicator color={tint} />
            ) : (
              <Text type="secondary">这里空空如也喵</Text>
            )}
          </View>
        )}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator style={{ margin: 20 }} color={tint} />
          ) : null
        }
      />
    </View>
  );
}

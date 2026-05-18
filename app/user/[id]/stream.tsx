import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  getMember,
  getMemberActivities,
  getMemberRelations,
} from '@/api/zhihu';
import { CreationCard } from '@/components/CreationCard';
import { ZhihuMemberRelation } from '@/types/zhihu';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserStreamScreen() {
  const { id, type, initialId } = useLocalSearchParams<{
    id: string;
    type: string;
    initialId?: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [hasScrolledToInitial, setHasScrolledToInitial] = useState(false);

  const activeTab = type || 'answers';

  // 1. Fetch User Profile Details
  const { data: user } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: async () => {
      try {
        return await getMember(id as string);
      } catch (err: any) {
        if (err.response?.status === 403)
          return await getMember(
            id as string,
            'follower_count,headline,cover_url,description,answer_count,articles_count,question_count,pins_count',
          );
        return null;
      }
    },
  });

  // 2. Infinite Query for specific content type stream
  const {
    data: streamData,
    isLoading: streamLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['user-stream', id, activeTab],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const targetId = user?.url_token || id;
        if (activeTab === 'activities')
          return await getMemberActivities(targetId, 20, pageParam as number);

        let include = '';
        if (activeTab === 'answers')
          include =
            'data[*].content,data[*].voteup_count,data[*].comment_count,data[*].created_time,data[*].updated_time,data[*].excerpt,data[*].question.title,data[*].relationship.voting,data[*].relationship.is_thanked';
        else if (activeTab === 'questions')
          include =
            'data[*].created,data[*].answer_count,data[*].follower_count,data[*].author,data[*].admin_closed_comment,data[*].relationship.is_following';
        else if (activeTab === 'articles')
          include =
            'data[*].comment_count,data[*].content,data[*].voteup_count,data[*].created,data[*].updated,data[*].title,data[*].excerpt,data[*].relationship.voting';
        else if (activeTab === 'pins')
          include =
            'data[*].content,data[*].reaction_count,data[*].comment_count,data[*].created,data[*].relationship.voting';

        return await getMemberRelations(targetId, activeTab as any, {
          limit: 20,
          offset: pageParam as number,
          include,
        });
      } catch (err) {
        console.error(`获取${activeTab}流失败:`, err);
        return { data: [], paging: { is_end: true } };
      }
    },
    initialPageParam: 0 as number | string,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const match = lastPage.paging?.next?.match(/offset=(\d+)/);
      return match ? match[1] : undefined;
    },
  });

  const streamItems = streamData?.pages.flatMap((page) => page.data || []) || [];

  // Scroll to clicked/initial item if found in loaded stream
  useEffect(() => {
    if (initialId && streamItems.length > 0 && !hasScrolledToInitial) {
      const index = streamItems.findIndex((item) => {
        const displayItem = activeTab === 'activities' ? item.target || item : item;
        return displayItem?.id?.toString() === initialId?.toString();
      });
      if (index !== -1) {
        setHasScrolledToInitial(true);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0,
          });
        }, 300);
      }
    }
  }, [streamItems, initialId, hasScrolledToInitial, activeTab]);

  const renderItemContent = ({ item, index }: { item: any; index: number }) => {
    let displayItem = item as any;
    if (activeTab === 'activities') displayItem = item.target || item;
    if (!displayItem || (!displayItem.id && !displayItem.url)) return null;

    let itemType: 'answer' | 'article' | 'question' | 'pin' | 'video' = 'answer';
    const typeStr = displayItem.type;
    if (typeStr === 'article') itemType = 'article';
    else if (typeStr === 'question') itemType = 'question';
    else if (typeStr === 'pin') itemType = 'pin';
    else if (typeStr === 'zvideo' || typeStr === 'video') itemType = 'video';

    const isHighlighted = initialId && displayItem.id?.toString() === initialId?.toString();

    return (
      <View
        className="px-4 py-1.5 bg-transparent"
        style={isHighlighted && {
          borderLeftWidth: 3,
          borderLeftColor: '#0084ff',
        }}
      >
        <CreationCard item={displayItem} type={itemType} />
      </View>
    );
  };

  const getTypeName = () => {
    if (activeTab === 'answers') return '回答';
    if (activeTab === 'articles') return '文章';
    if (activeTab === 'questions') return '提问';
    if (activeTab === 'pins') return '想法';
    return '动态';
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: Colors[colorScheme].background,
        paddingTop: insets.top,
      }}
    >
      {/* 1. Header Bar */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800"
        style={{ backgroundColor: Colors[colorScheme].background }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-1 -ml-1 bg-transparent"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>

        {/* User Mini Profile */}
        <Pressable
          onPress={() =>
            router.push(`/user/${user?.url_token || id}`)
          }
          className="flex-row items-center ml-2 flex-1 bg-transparent"
        >
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://picx.zhimg.com/v2-abed1a8c04702bc9e7ba3d3d82bc7591_l.jpg',
            }}
            className="w-8 h-8 rounded-full"
          />
          <View className="ml-2 bg-transparent flex-1">
            <Text className="font-bold text-sm" numberOfLines={1}>
              {user?.name || '加载中...'}
            </Text>
            <Text type="secondary" className="text-[11px]" numberOfLines={1}>
              {user?.headline || '查看全部个人主页'}
            </Text>
          </View>
        </Pressable>

        {/* Content Type Badge */}
        <View
          className="px-2.5 py-1 rounded-full ml-2"
          style={{ backgroundColor: 'rgba(0,132,255,0.08)' }}
        >
          <Text type="primary" className="text-xs font-bold">
            {getTypeName()}流
          </Text>
        </View>
      </View>

      {/* 2. Content Stream List */}
      <FlatList
        ref={flatListRef}
        data={streamItems}
        keyExtractor={(item, index) => `stream-${item.id || ''}-${index}`}
        renderItem={renderItemContent}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 50 }}
        ListEmptyComponent={
          streamLoading ? (
            <ActivityIndicator
              style={{ marginTop: 100 }}
              color={Colors[colorScheme].primary}
            />
          ) : (
            <Text type="secondary" className="text-center mt-20 text-sm">
              暂无内容流 喵~
            </Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={{ margin: 20 }}
              color={Colors[colorScheme].primary}
            />
          ) : streamItems.length > 0 && !hasNextPage ? (
            <Text type="secondary" className="text-center p-5 text-xs">
              — 已经到底了喵 —
            </Text>
          ) : null
        }
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.highestMeasuredFrameIndex * 150,
            animated: true,
          });
        }}
      />
    </SafeAreaView>
  );
}

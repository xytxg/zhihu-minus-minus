import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Animated, { SharedTransition } from 'react-native-reanimated';
import type { FeedItem } from '@/api/zhihu';
import { useAuthStore } from '@/store/useAuthStore';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LikeButton } from './LikeButton';
import { type ShareContentType, ShareMenu } from './ShareMenu';
import { Text, View } from './Themed';

const slowTransition = SharedTransition.duration(600);

export const FeedCard = ({ item, tab }: { item: FeedItem; tab?: string }) => {
  const router = useRouter();
  const { cookies } = useAuthStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const isQuestionType = item.type === 'questions';
  const isGuest = !cookies;
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => {
        if (isGuest) {
          router.push({
            pathname: '/guest/detail',
            params: { item: JSON.stringify(item) },
          } as any);
          return;
        }
        const routeType = item.type.slice(0, -1);
        const params: any = {
          title: item.title,
          questionId: item.questionId,
        };
        if (tab) {
          params.source = 'feed';
          params.tab = tab;
        }
        router.push({
          pathname: `/${routeType}/${item.id}`,
          params,
        } as any);
      }}
      style={[
        {
          backgroundColor: Colors[colorScheme].backgroundSecondary,
          borderRadius: 12,
        },
        isQuestionType ? { paddingBottom: 10 } : undefined,
      ]}
      className="p-4 mb-2 shadow-sm"
    >
      {/* 动态动作提示 (针对关注流) */}
      {item.actionText && (
        <Text
          type="secondary"
          className="text-[13px] mb-2 text-tertiary dark:text-tertiary-dark"
        >
          {item.actionText}
        </Text>
      )}

      {/* 热区1：点击作者头像/姓名 -> 用户页 */}
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() =>
          router.push({
            pathname: `/user/${item.author.url_token || item.author.id}`,
            params: { avatar: item.author.avatar },
          } as any)
        }
        className="flex-row items-center mb-2"
      >
        <Animated.Image
          source={{ uri: item.author.avatar }}
          className="w-[22px] h-[22px] rounded-full"
          sharedTransitionTag={`avatar-${item.author.url_token || item.author.id}`}
        />
        <Text type="secondary" className="ml-2 text-[13px]">
          {item.author.name}
        </Text>
      </TouchableOpacity>

      {/* 话题标签 */}
      {item.topics && item.topics.length > 0 && (
        <View className="flex-row flex-wrap mb-2 bg-transparent">
          {item.topics.map((topic: any) => (
            <TouchableOpacity
              activeOpacity={0.6}
              key={topic.id}
              onPress={() => router.push(`/topic/${topic.id}` as any)}
              className="px-2 py-0.5 rounded-sm mr-2 mb-1"
              style={{ backgroundColor: 'rgba(0,0,132,0.05)' }}
            >
              <Text className="text-[11px] text-tertiary dark:text-tertiary-dark">
                {topic.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 标题 - 统一为主卡片点击，完美穿透 */}
      {item.title ? (
        <Animated.View
          sharedTransitionTag={`title-${item.questionId || item.id}`}
          sharedTransitionStyle={slowTransition}
          className="mb-1.5"
        >
          <Text
            className="text-lg font-bold leading-6 text-foreground dark:text-foreground-dark"
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </Animated.View>
      ) : null}

      {/* 摘要与图片 - 统一为主卡片点击，完美穿透 */}
      <View className="flex-row mt-1 bg-transparent">
        <View className="flex-1 bg-transparent">
          <Text
            type="secondary"
            className="text-[17px]"
            style={{ lineHeight: 27 }}
            numberOfLines={3}
          >
            {item.excerpt}
          </Text>
        </View>
        {item.image && (
          <Animated.Image
            source={{ uri: item.image }}
            className="w-[100px] h-[70px] rounded-md ml-2.5"
            sharedTransitionTag={`image-${item.id}`}
          />
        )}
      </View>

      {/* 热区4：底部操作栏 - 问题关注类动态不显示 */}
      {!isQuestionType && (
        <View className="flex-row mt-4 items-center bg-transparent">
          <LikeButton
            id={item.id}
            count={item.voteCount}
            voted={item.voted}
            type={item.type as any}
            variant="ghost"
          />

          {/* 点击评论按钮 -> 评论页 */}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              const type =
                item.type === 'articles'
                  ? 'article'
                  : item.type === 'answers'
                    ? 'answer'
                    : item.type.slice(0, -1);
              router.push(
                `/comments/${item.id}?type=${type}&count=${item.commentCount}`,
              );
            }}
            className="flex-row items-center ml-5 bg-transparent py-1"
          >
            <Ionicons name="chatbubble-outline" size={16} color="#888" />
            <Text className="text-[#888] ml-1 text-xs font-semibold">
              {item.commentCount > 0 ? item.commentCount : '评论'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setMenuVisible(true)}
            className="ml-auto p-2 -mr-2 bg-transparent"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      <ShareMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        type={item.type.slice(0, -1) as ShareContentType}
        data={{
          id: item.id,
          title: item.title,
          author: item.author?.name,
          authorHeadline: item.author?.headline,
          excerpt: item.excerpt,
        }}
      />
    </TouchableOpacity>
  );
};

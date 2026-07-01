import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  followMember,
  getMe,
  getMember,
  getMemberActivities,
  getMemberRelations,
  searchContent,
  unfollowMember,
} from '@/api/zhihu';
import { FeedCard } from '@/components/FeedCard';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { ZhihuMemberRelation } from '@/types/zhihu';

const subTabKeys: ('answers' | 'articles' | 'questions' | 'pins')[] = [
  'answers',
  'articles',
  'questions',
  'pins',
];

export default function UserDetailScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { id, avatar: initialAvatar } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [activeMainTab, setActiveMainTab] = useState(0); // 0: 创作, 1: 动态 (默认创作)
  const [activeTab, setActiveTab] = useState<
    'activities' | 'answers' | 'questions' | 'articles' | 'pins'
  >('answers');
  const [sortBy, setSortBy] = useState<'created' | 'voteups'>('created');
  const [followLoading, setFollowLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const flashListRef = useRef<any>(null);

  const nestedSubTabIndexRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    navigation.setOptions({ title: '个人主页' });
  }, [navigation]);

  const borderColor = Colors[colorScheme].border;
  const { primaryColor: customPrimaryColor } = useSettingsStore();
  const primaryColor = customPrimaryColor || '#0084ff';

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => getMe() });
  const isMe = me?.id === id;

  const { data: user, refetch: refetchUser } = useQuery({
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

  const {
    data: listData,
    isLoading: listLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchList,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['user-list', id, activeTab, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const targetId = user?.url_token || id;
        if (activeTab === 'activities')
          return await getMemberActivities(targetId, 20, pageParam as number);

        let include = '';
        if (activeTab === 'answers')
          include =
            'data[*].content,data[*].voteup_count,data[*].comment_count,data[*].favlists_count,data[*].created_time,data[*].updated_time,data[*].excerpt,data[*].question.title,data[*].relationship.voting,data[*].relationship.is_thanked';
        else if (activeTab === 'questions')
          include =
            'data[*].created,data[*].answer_count,data[*].follower_count,data[*].author,data[*].admin_closed_comment,data[*].relationship.is_following';
        else if (activeTab === 'articles')
          include =
            'data[*].comment_count,data[*].content,data[*].voteup_count,data[*].favlists_count,data[*].created,data[*].updated,data[*].title,data[*].excerpt,data[*].relationship.voting';
        else if (activeTab === 'pins')
          include =
            'data[*].content,data[*].reaction_count,data[*].comment_count,data[*].created,data[*].relationship.voting';

        return await getMemberRelations(targetId, activeTab, {
          limit: 20,
          offset: pageParam as number,
          include,
          sort_by: activeTab === 'answers' ? sortBy : undefined,
        });
      } catch (err) {
        console.error(`获取${activeTab}列表失败:`, err);
        return { data: [], paging: { is_end: true } };
      }
    },
    initialPageParam: 0 as number | string,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.paging?.is_end) return undefined;
      const match = lastPage.paging?.next?.match(/offset=(\d+)/);
      return match ? match[1] : undefined;
    },
    enabled: user !== undefined,
  });

  const listItems = listData?.pages.flatMap((page) => page.data || []) || [];

  const {
    data: searchResults,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: searchLoading,
    refetch: refetchSearch,
  } = useInfiniteQuery({
    queryKey: ['user-creations-search', user?.id, debouncedSearchQuery],
    queryFn: ({ pageParam = 0 }) =>
      searchContent(debouncedSearchQuery, pageParam as number, 20, 'general', {
        restricted_scene: 'member',
        restricted_field: 'member_hash_id',
        restricted_value: user?.id,
      }),
    enabled: debouncedSearchQuery.length > 0 && !!user?.id,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.paging?.is_end) return undefined;
      const match = lastPage.paging?.next?.match(/offset=(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    },
  });

  const HighlightText = (
    text: string,
    highlightColor: string = primaryColor,
  ) => {
    if (!text) return '';
    const decodedText = text
      .replace(/&lt;em&gt;/g, '[[EM]]')
      .replace(/&lt;\/em&gt;/g, '[[/EM]]')
      .replace(/<em>/g, '[[EM]]')
      .replace(/<\/em>/g, '[[/EM]]')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
    const parts = decodedText.split(/(\[\[EM\]\].*?\[\[\/EM\]\])/gs);
    return (
      <React.Fragment>
        {parts.map((part, i) =>
          part.startsWith('[[EM]]') && part.endsWith('[[/EM]]') ? (
            <Text
              key={i}
              type="primary"
              className="font-bold"
              style={{ color: highlightColor }}
            >
              {part.replace(/\[\[\/?EM\]\]/g, '')}
            </Text>
          ) : (
            part
          ),
        )}
      </React.Fragment>
    );
  };

  const parseSearchResult = (item: any) => {
    const obj = item.object;
    if (!obj) return null;
    const highlight = item.highlight || {};
    return {
      id: obj.id,
      type: obj.type + 's',
      title: highlight.title
        ? HighlightText(highlight.title)
        : obj.question?.name || obj.title || '无标题',
      titleString: obj.question?.name || obj.title || '无标题',
      excerpt: highlight.description
        ? HighlightText(highlight.description)
        : obj.excerpt || '',
      image: obj.thumbnail_info?.thumbnails?.[0]?.url || null,
      voteCount: obj.voteup_count || 0,
      commentCount: obj.comment_count || 0,
      author: {
        id: obj.author?.id,
        name: obj.author?.name || '匿名用户',
        avatar: obj.author?.avatar_url,
        url_token: obj.author?.url_token,
      },
      questionId: obj.question?.id || obj.id,
      voted: obj.relationship?.voting || 0,
    };
  };

  const isSearching = debouncedSearchQuery.length > 0;
  const currentListItems = isSearching
    ? searchResults?.pages.flatMap(
        (page) => page.data?.map(parseSearchResult).filter(Boolean) || [],
      ) || []
    : listItems;


  const getSubTabIndex = (tab: string) => {
    const index = subTabKeys.indexOf(tab as any);
    return index === -1 ? 0 : index;
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const targetId = user?.url_token || id;
      if (user?.is_following) await unfollowMember(targetId);
      else await followMember(targetId);
      refetchUser();
    } catch (err) {
      console.error('关注操作失败:', err);
      Alert.alert('提示', '操作失败，请重试');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRefresh = async () => {
    refetchUser();
    if (isSearching) {
      refetchSearch();
    } else {
      refetchList();
    }
  };

  const renderHeader = () => (
    <View className="bg-transparent">
      <Image
        source={{
          uri:
            user?.cover_url ||
            'https://picx.zhimg.com/v2-3975ba668e1c6670e309228892697843_b.jpg',
        }}
        className="h-[140px] w-full"
      />
      <View type="surface" className="px-5 pt-0 pb-5 rounded-b-[24px]">
        <View className="flex-row justify-between items-end -mt-10">
          <Reanimated.Image
            source={{ uri: user?.avatar_url || (initialAvatar as string) }}
            className="w-20 h-20 rounded-[40px] border-4 border-white dark:border-[#1e1e22]"
            sharedTransitionTag={`avatar-${user?.url_token || id}`}
          />
          {!isMe && (
            <Pressable
              className="px-5 h-9 rounded-full justify-center items-center mb-1.5"
              style={[
                user?.is_following
                  ? {
                      backgroundColor: 'transparent',
                      borderColor: borderColor,
                      borderWidth: 1,
                    }
                  : { backgroundColor: primaryColor },
              ]}
              onPress={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    user?.is_following
                      ? Colors[colorScheme].textSecondary
                      : '#fff'
                  }
                />
              ) : (
                <Text
                  className="font-bold text-sm"
                  style={[
                    { color: '#fff' },
                    user?.is_following && {
                      color: Colors[colorScheme].textSecondary,
                    },
                  ]}
                >
                  {user?.is_following ? '已关注' : '关注'}
                </Text>
              )}
            </Pressable>
          )}
        </View>
        <Text className="text-[22px] font-bold mt-2.5">{user?.name}</Text>
        <Text type="secondary" className="mt-1.5 text-sm">
          {user?.headline}
        </Text>

        {user?.description ? (
          <Text
            type="secondary"
            className="mt-2.5 text-[13px] leading-[18px]"
            numberOfLines={3}
          >
            {user.description}
          </Text>
        ) : null}

        {!isMe && (user?.mutual_followees_count || 0) > 0 && (
          <Pressable
            className="flex-row items-center mt-[15px] p-2.5 rounded-lg bg-black/5 dark:bg-white/5"
            onPress={() => router.push(`/user/${user?.url_token || id}/mutual`)}
          >
            <Text className="text-[13px]">
              <Text className="font-bold">{user.mutual_followees_count}</Text>{' '}
              位共同关注
            </Text>
            <Image
              source={{
                uri: 'https://pic1.zhimg.com/v2-abed1a8c04702bc9e7ba3d3d82bc7591_s.jpg',
              }}
              className="w-5 h-5 rounded-full ml-2"
            />
          </Pressable>
        )}

        <View className="flex-row mt-5 pt-[15px] bg-transparent">
          <Pressable
            className="mr-[30px] items-center"
            onPress={() =>
              router.push(`/user/${user?.url_token || id}/followers`)
            }
          >
            <Text className="font-bold text-lg">
              {user?.follower_count || 0}
            </Text>
            <Text type="secondary" className="text-xs mt-0.5">
              关注者
            </Text>
          </Pressable>
          <Pressable
            className="mr-[30px] items-center"
            onPress={() =>
              router.push(`/user/${user?.url_token || id}/following`)
            }
          >
            <Text className="font-bold text-lg">
              {user?.following_count || 0}
            </Text>
            <Text type="secondary" className="text-xs mt-0.5">
              关注
            </Text>
          </Pressable>
          <View className="items-center">
            <Text className="font-bold text-lg">{user?.voteup_count || 0}</Text>
            <Text type="secondary" className="text-xs mt-0.5">
              赞同
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View className="pb-1 pt-1 bg-transparent">
      <View
        className="flex-row items-center rounded-3xl mx-[15px] my-2.5 pr-2.5 h-9"
        style={{ backgroundColor: Colors[colorScheme].backgroundTertiary }}
      >
        <Ionicons
          name="search"
          size={16}
          color={Colors[colorScheme].textTertiary}
          className="ml-2.5"
        />
        <TextInput
          className="flex-1 text-sm px-2.5 h-full py-0"
          style={{
            color: Colors[colorScheme].text,
            textAlignVertical: 'center',
          }}
          placeholder={`搜索 ${user?.name || '用户'} 的创作...`}
          placeholderTextColor={Colors[colorScheme].textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {isSearching && searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} className="p-[5px]">
            <Ionicons
              name="close-circle"
              size={16}
              color={Colors[colorScheme].textTertiary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderMainTabsSelector = () => (
    <View className="flex-row bg-transparent my-1 border-b border-gray-100 dark:border-gray-800">
      {[
        { index: 0, label: '创作' },
        { index: 1, label: '动态' },
      ].map((tab) => (
        <Pressable
          key={tab.index}
          onPress={() => {
            setActiveMainTab(tab.index);
            if (tab.index === 1) {
              setActiveTab('activities');
            } else {
              if (activeTab === 'activities') {
                setActiveTab(subTabKeys[nestedSubTabIndexRef.current]);
              }
            }
            flashListRef.current?.scrollToOffset({
              offset: 0,
              animated: false,
            });
          }}
          className="flex-1 py-3.5 items-center"
          style={
            activeMainTab === tab.index && {
              borderBottomWidth: 2.5,
              borderBottomColor: primaryColor,
            }
          }
        >
          <Text
            className="font-bold text-[16px]"
            style={{
              color:
                activeMainTab === tab.index
                  ? primaryColor
                  : Colors[colorScheme].textSecondary,
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderCreationsSubTabs = () => (
    <View className="flex-row bg-transparent py-3 px-4 justify-between items-center">
      {[
        { key: 'answers', label: '回答', count: user?.answer_count },
        { key: 'articles', label: '文章', count: user?.articles_count },
        { key: 'questions', label: '提问', count: user?.question_count },
        { key: 'pins', label: '想法', count: user?.pins_count },
      ].map((subTab) => {
        const isActive = !isSearching && activeTab === subTab.key;
        return (
          <Pressable
            key={subTab.key}
            onPress={() => {
              if (!isSearching) {
                const key = subTab.key as any;
                setActiveTab(key);
                const targetIndex = getSubTabIndex(key);
                nestedSubTabIndexRef.current = targetIndex;
                flashListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: false,
                });
              }
            }}
            className="px-4 py-1.5 rounded-full items-center justify-center"
            style={[
              isActive
                ? { backgroundColor: primaryColor }
                : {
                    backgroundColor:
                      colorScheme === 'light'
                        ? 'rgba(0,0,0,0.04)'
                        : 'rgba(255,255,255,0.06)',
                  },
              { minWidth: 68 },
            ]}
          >
            <Text
              className="font-bold text-[12.5px]"
              style={{
                color: isActive ? '#fff' : Colors[colorScheme].textSecondary,
              }}
            >
              {subTab.label}
              {subTab.count !== undefined && subTab.count > 0
                ? ` ${subTab.count}`
                : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderAnswersSortSelector = () => {
    if (isSearching || activeTab !== 'answers') return null;
    return (
      <View
        className="flex-row px-[15px] py-2.5 bg-black/5 dark:bg-white/5"
        style={{ borderBottomWidth: 0 }}
      >
        {[
          { key: 'created', label: '最新' },
          { key: 'voteups', label: '赞同' },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setSortBy(item.key as any)}
            className="px-3 py-1 mr-2.5 rounded"
            style={[
              sortBy === item.key && {
                backgroundColor: 'rgba(0,132,255,0.08)',
              },
            ]}
          >
            <Text
              type={sortBy === item.key ? 'primary' : 'secondary'}
              className="text-[13px]"
              style={[sortBy === item.key && { fontWeight: 'bold' }]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderItemContent = (item: any, _index: number) => {
    if (isSearching) {
      return <FeedCard item={item} />;
    }

    let displayItem = item as ZhihuMemberRelation;
    if (activeTab === 'activities') {
      displayItem = item.target || item;
    }
    if (!displayItem || (!displayItem.id && !displayItem.url)) return null;

    const rawType = displayItem.type;
    let mappedType: 'answers' | 'articles' | 'questions' | 'pins' = 'answers';
    if (rawType === 'article') mappedType = 'articles';
    else if (rawType === 'question') mappedType = 'questions';
    else if (rawType === 'pin') mappedType = 'pins';
    else if (rawType === 'zvideo' || rawType === 'video') mappedType = 'answers';

    const getExcerptText = () => {
      if (rawType === 'pin') {
        if (Array.isArray(displayItem.content)) {
          return (displayItem.content as any[])
            .filter((c) => c.type === 'text')
            .map((c) => c.content)
            .join('')
            .replace(/<[^>]+>/g, '')
            .substring(0, 150);
        }
        if (typeof displayItem.content === 'string') {
          return (displayItem.content as string).replace(/<[^>]+>/g, '').substring(0, 150);
        }
      }
      const raw = (displayItem as any).excerpt || displayItem.content || '';
      if (typeof raw === 'string') return raw.replace(/<[^>]+>/g, '').substring(0, 150);
      return '';
    };

    const imageUrl = 
      displayItem.image_url || 
      displayItem.thumbnail || 
      (rawType === 'pin' && Array.isArray(displayItem.content)
        ? displayItem.content.find((c: any) => c.type === 'image')?.url
        : null) || 
      null;

    const feedItem: any = {
      id: displayItem.id?.toString() || Math.random().toString(),
      title: displayItem.question?.title || displayItem.title || '',
      questionId: displayItem.question?.id?.toString() || (rawType === 'question' ? displayItem.id?.toString() : undefined),
      author: {
        id: displayItem.author?.id || user?.id || '',
        url_token: displayItem.author?.url_token || user?.url_token || '',
        name: displayItem.author?.name || user?.name || '匿名用户',
        avatar: displayItem.author?.avatar_url || user?.avatar_url || 'https://picx.zhimg.com/v2-abed1a8c04702bc9e7ba3d3d82bc7591_s.jpg',
        headline: displayItem.author?.headline || user?.headline || '',
      },
      excerpt: getExcerptText(),
      image: imageUrl,
      voteCount: displayItem.voteup_count || displayItem.like_count || displayItem.reaction_count || 0,
      commentCount: displayItem.comment_count || 0,
      favlistsCount: displayItem.favlists_count || 0,
      voted: displayItem.relationship?.voting || 0,
      type: mappedType,
    };

    return <FeedCard item={feedItem} />;
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors[colorScheme].background }}
    >
      <FlashList
        ref={flashListRef}
        data={currentListItems}
        renderItem={({ item, index }) => renderItemContent(item, index)}
        keyExtractor={(item: any, index: number) =>
          `user-item-${item.id || ''}-${index}`
        }
        {...({ estimatedItemSize: 250 } as any)}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View className="bg-transparent">
            {renderHeader()}
            {renderSearchBar()}
            {renderMainTabsSelector()}
            {activeMainTab === 0 && (
              <View className="bg-transparent">
                {renderCreationsSubTabs()}
                {renderAnswersSortSelector()}
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="bg-transparent">
            {listLoading || searchLoading || isFetchingNextPage ? (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={primaryColor}
              />
            ) : currentListItems.length > 0 &&
              !(isSearching ? hasNextSearchPage : hasNextPage) ? (
              <Text type="secondary" className="text-center p-5 text-xs">
                — 已经到底了喵 —
              </Text>
            ) : null}
          </View>
        }
        onEndReached={() => {
          if (isSearching) {
            if (hasNextSearchPage && !isFetchingNextSearchPage)
              fetchNextSearchPage();
          } else {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
      />

    </View>
  );
}

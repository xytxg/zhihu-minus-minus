import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '../client';

export interface FeedAuthor {
  id: string;
  url_token?: string;
  name: string;
  avatar: string;
  headline?: string;
}

export interface FeedTopic {
  id: string;
  name: string;
}

export interface FeedItem {
  id: string;
  title: any;
  questionId?: string;
  actionText?: string;
  author: FeedAuthor;
  excerpt: any;
  content: string;
  image: string | null;
  voteCount: number;
  commentCount: number;
  favlistsCount?: number;
  voted: number;
  type: 'answers' | 'articles' | 'pins' | 'questions';
  topics: FeedTopic[];
  rank?: number;
  hotValue?: string;
  titleString?: string;
}

export interface RawFeedTarget {
  id: string | number;
  type: string;
  title?: string;
  excerpt?: string;
  content?: any;
  thumbnail?: string;
  content_img?: string[];
  voteup_count?: number;
  like_count?: number;
  comment_count?: number;
  favlists_count?: number;
  favorite_count?: number;
  reaction?: {
    relation?: {
      liked?: boolean;
      faved?: boolean;
    };
    statistics?: {
      like_count?: number;
      favorites?: number;
    };
  };
  relationship?: {
    voting?: number;
  };
  author?: {
    id: string;
    name: string;
    avatar_url: string;
    headline?: string;
    url_token?: string;
  };
  question?: {
    id: string | number;
    title: string;
  };
  topics?: Array<{
    id: string;
    name: string;
  }>;
  url?: string;
  detail_text?: string;
}

export interface RawFeedItem {
  id?: string | number;
  type?: string;
  action_text?: string;
  target?: RawFeedTarget;
  children?: Array<{
    thumbnail?: string;
  }>;
  image_url?: string;
}

export interface ZhihuFeedResponse {
  data: RawFeedItem[];
  paging: {
    is_end: boolean;
    is_start: boolean;
    next: string;
    previous: string;
  };
}

export const FEED_URLS = {
  following: 'https://www.zhihu.com/api/v3/moments?limit=10',
  recommend: 'https://www.zhihu.com/api/v3/feed/topstory/recommend?limit=10',
  hot: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50',
};

export const getFeed = async (url: string): Promise<ZhihuFeedResponse> => {
  let finalUrl = url;
  const { cookies } = useAuthStore.getState();

  // 如果未登录且请求的是推荐页初始接口，则切换为游客接口
  if (!cookies && url.includes('feed/topstory/recommend')) {
    finalUrl =
      'https://www.zhihu.com/api/v3/explore/guest/feeds?limit=15&ws_qiangzhisafe=0';
  }

  const res = await apiClient.get<ZhihuFeedResponse>(finalUrl);
  return res.data;
};

import type { ZhihuColumnDetail } from '../../types/zhihu';
import apiClient from '../client';

export const getColumn = async (
  id: string | number,
): Promise<ZhihuColumnDetail> => {
  const include =
    'intro,followers,articles_count,items_count,author,is_following';
  const res = await apiClient.get(`/columns/${id}`, {
    params: { include },
  });
  return res.data;
};

export const getColumnItems = async (
  id: string | number,
  limit = 20,
  offset = 0,
): Promise<{ paging: { is_end: boolean; next: string }; data: any[] }> => {
  const res = await apiClient.get(`/columns/${id}/items`, {
    params: {
      limit,
      offset,
      ws_qiangzhisafe: 0,
    },
  });
  return res.data;
};

export const getArticleColumnCard = async (
  articleId: string | number,
): Promise<ZhihuColumnDetail> => {
  const res = await apiClient.get(`/column/articles/${articleId}/card`);
  return res.data;
};

export const followColumn = async (
  columnId: string | number,
): Promise<{ member_count?: number; is_following?: boolean }> => {
  const res = await apiClient.post(`/columns/${columnId}/followers`);
  return res.data;
};

export const unfollowColumn = async (
  columnId: string | number,
): Promise<{ member_count?: number; is_following?: boolean }> => {
  const res = await apiClient.delete(`/columns/${columnId}/followers`);
  return res.data;
};

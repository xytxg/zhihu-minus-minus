import type { ZhihuColumnDetail } from '../../types/zhihu';
import apiClient from '../client';

export const getColumn = async (id: string | number): Promise<ZhihuColumnDetail> => {
  const include = 'intro,followers,articles_count,items_count,author';
  const res = await apiClient.get(`/columns/${id}`, {
    params: { include },
  });
  return res.data;
};

export const getColumnItems = async (
  id: string | number,
  limit = 20,
  offset = 0,
) => {
  const res = await apiClient.get(`/columns/${id}/items`, {
    params: {
      limit,
      offset,
      ws_qiangzhisafe: 0,
    },
  });
  return res.data;
};

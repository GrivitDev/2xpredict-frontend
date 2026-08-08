import api from '@/lib/axios';

export const getArticles =
  async () => {
    const response = await api.get(
      '/posts',
    );

    return response.data;
  };

export const getArticle =
  async (slug: string) => {
    const response = await api.get(
      `/posts/${slug}`,
    );

    return response.data;
  };

export const createArticle =
  async (
    data: any,

    token: string,
  ) => {
    const response = await api.post(
      '/posts',

      data,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };
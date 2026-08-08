import api from '@/lib/axios';

export const initializeVipPayment =
  async (
    plan: string,

    token: string,
  ) => {
    const response = await api.post(
      '/subscriptions/initialize',

      {
        plan,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

export const verifyVipPayment =
  async (
    reference: string,
  ) => {
    const response = await api.get(
      `/subscriptions/verify/${reference}`,
    );

    return response.data;
  };
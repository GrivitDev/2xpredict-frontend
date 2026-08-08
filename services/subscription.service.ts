import api from '@/lib/axios';

export interface UpgradePriceResponse {
  currentPlan: 'free' | 'regular' | 'vip';

  regularPrice: number;

  vipPrice: number;

  subscriptionDurationDays: number;

  daysRemaining: number;

  credit: number;

  regularDailyPrice: number;

  vipDailyPrice: number;

  upgradeDailyPrice: number;

  upgradeCost: number;

  amount: number;

  canUpgrade: boolean;
}

export async function getUpgradePrice(): Promise<UpgradePriceResponse> {
  const { data } = await api.get<UpgradePriceResponse>(
    '/subscriptions/upgrade-price',
  );

  return data;
}

export const subscriptionService = {
  async getStatus() {
    const res = await api.get('/subscriptions/status');

    return res.data;
  },
};
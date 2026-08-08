import api from '@/lib/axios';
export const purchaseService = {
  async getMyPurchases() {
    const res = await api.get('/purchases/me');
    return res.data;
  },

  async initialize(predictionId: string) {
    const res = await api.post('/purchases/initialize', {
      predictionId,
    });

    return res.data;
  },
};
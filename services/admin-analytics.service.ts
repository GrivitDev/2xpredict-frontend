// src/services/admin-analytics.service.ts


import api from '@/lib/axios';

import {
  AnalyticsDashboardResponse,
} from '@/types/analytics.types';


// =====================================================
// GET ADMIN DASHBOARD ANALYTICS
// =====================================================

export const getAnalyticsDashboard =
async (): Promise<AnalyticsDashboardResponse> => {

  try {

    const res = await api.get(
      '/analytics/dashboard',
    );


    return res.data;


  } catch (err: any) {

    throw (
      err?.response?.data ||
      err
    );

  }

};
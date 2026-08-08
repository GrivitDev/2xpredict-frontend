import api from '@/lib/axios';

// =========================
// DASHBOARD ANALYTICS
// =========================
export const getDashboardAnalytics = async () => {
  try {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || err;
  }
};

// =========================
// RECENT PAYMENTS
// =========================
export const getRecentPayments = async () => {
  try {
    const res = await api.get('/analytics/recent-payments');
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || err;
  }
};

// =========================
// RECENT USERS
// =========================
export const getRecentUsers = async () => {
  try {
    const res = await api.get('/analytics/recent-users');
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || err;
  }
};
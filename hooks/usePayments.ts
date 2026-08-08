'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/payment.service';

export function usePayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await paymentService.getMyPayments();

      setPayments(res || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    loading,
    payments,
    error,
    refetch: fetchPayments,
  };
}
'use client';

import { useEffect, useState } from 'react';
import { subscriptionService } from '@/services/subscription.service';

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plan, setPlan] = useState<'free' | 'regular' | 'vip'>('free');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const res = await subscriptionService.getStatus();

        setSubscription(res.subscription);
        setPlan(res.plan);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return {
    loading,
    subscription,
    plan,
  };
}
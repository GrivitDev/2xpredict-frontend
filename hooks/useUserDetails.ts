'use client';

import { useEffect, useState } from 'react';

import { getUser } from '@/services/admin-users.service';

export function useUserDetails(userId: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const data = await getUser(userId);

      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return {
    user,
    loading,
    refetch: fetchUser,
  };
}
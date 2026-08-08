'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/services/admin-users.service';

export function useAdminUsers(filters: any, page: number) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

        const res = await getUsers({
        search: filters.search,
        status: filters.status,
        role: filters.role,
        page,
        });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);

      setLoading(false);
    };

    fetchUsers();
  }, [filters, page]);

  return { users, loading, totalPages };
}
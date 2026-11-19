'use client';

import { useEffect, useState } from 'react';
import { useAdminUsers } from '@/hooks/use-admin-users';
import UsersTable from '@/components/admin/users/UsersTable';

const initialFilters = {
  search: '',
  status: 'all',
  role: 'all',
  isVerified: 'all',
  plan: 'all',
  createdFrom: '',
  createdTo: '',
};

export default function UsersPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((old) => ({ ...old, search }));
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Exclude empty date values so the backend's IsDateString validation
  // does not reject requests when no date filter has been selected.
  const { createdFrom, createdTo, ...filterQuery } = filters;

  const query = {
    ...filterQuery,
    page,
    limit: 20,
    isVerified:
      filters.isVerified === 'all'
        ? undefined
        : filters.isVerified === 'true',
    plan: filters.plan,
    ...(createdFrom ? { createdFrom } : {}),
    ...(createdTo ? { createdTo } : {}),
  };

  const {
    users,
    total,
    totalPages,
    loading,
    isFetching,
  } = useAdminUsers(query);

  const change = (
    key: keyof typeof initialFilters,
    value: string,
  ) => {
    setFilters((old) => ({ ...old, [key]: value }));
    setPage(1);
  };

  const reset = () => {
    setFilters(initialFilters);
    setSearch('');
    setPage(1);
  };

  return (
    <main className="mx-auto w-full max-w-[1680px] space-y-2.5 p-0">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold tracking-tight">Users</h1>

        <span className="text-xs tabular-nums text-muted-foreground">
          {total.toLocaleString()} users
        </span>
      </header>

      <section className="grid grid-cols-2 gap-2 rounded-lg border bg-card p-2 md:grid-cols-4 xl:grid-cols-6">
        <label className="col-span-2 block xl:col-span-2">
          <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Search
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, username"
            className="h-7 w-full rounded-md border bg-background px-2 text-[11px] outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => change('status', v)}
          options={[
            ['all', 'All'],
            ['active', 'Active'],
            ['pending', 'Pending'],
            ['suspended', 'Suspended'],
            ['deleted', 'Deleted'],
          ]}
        />

        <FilterSelect
          label="Role"
          value={filters.role}
          onChange={(v) => change('role', v)}
          options={[
            ['all', 'All'],
            ['user', 'User'],
            ['admin', 'Admin'],
          ]}
        />

        <FilterSelect
          label="Verification"
          value={filters.isVerified}
          onChange={(v) => change('isVerified', v)}
          options={[
            ['all', 'All'],
            ['true', 'Verified'],
            ['false', 'Unverified'],
          ]}
        />

        <FilterSelect
          label="Plan"
          value={filters.plan}
          onChange={(v) => change('plan', v)}
          options={[
            ['all', 'All'],
            ['free', 'Free'],
            ['regular', 'Regular'],
            ['vip', 'VIP'],
            ['premium', 'Premium'],
          ]}
        />

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
            From
          </span>

          <input
            type="date"
            value={filters.createdFrom}
            onChange={(e) => change('createdFrom', e.target.value)}
            className="h-7 w-full rounded-md border bg-background px-2 text-[11px]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
            To
          </span>

          <input
            type="date"
            value={filters.createdTo}
            onChange={(e) => change('createdTo', e.target.value)}
            className="h-7 w-full rounded-md border bg-background px-2 text-[11px]"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={reset}
            className="h-7 rounded-md border px-2.5 text-[11px] font-medium hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex h-8 items-center justify-between border-b px-2.5">
          <h2 className="text-[11px] font-semibold">Directory</h2>

          <span className="text-[11px] text-muted-foreground">
            {isFetching
              ? 'Updating…'
              : `Page ${page} / ${totalPages}`}
          </span>
        </div>

        <UsersTable users={users} loading={loading} />

        <footer className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {total
              ? `${Math.min((page - 1) * 20 + 1, total)}–${Math.min(
                  page * 20,
                  total,
                )} of ${total}`
              : '0 users'}
          </span>

          <div className="flex gap-1.5">
            <button
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              className="h-7 rounded-md border px-2.5 text-[10px] disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={page >= totalPages || isFetching}
              onClick={() =>
                setPage((v) => Math.min(totalPages, v + 1))
              }
              className="h-7 rounded-md border px-2.5 text-[10px] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-md border bg-background px-2 text-[11px] outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

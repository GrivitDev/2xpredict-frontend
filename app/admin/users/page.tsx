'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

import {
  motion,
} from 'framer-motion';

import {
  useAdminUsers,
} from '@/hooks/useAdminUsers';

import UsersTable from '@/components/admin/users/UsersTable';

const defaultFilters = {
  search: '',
  status: 'all',
  role: 'all',
};

export default function UsersPage() {
  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const {
    users,
    loading,
    totalPages,
  } = useAdminUsers(filters, page);

  const safeTotalPages = Math.max(totalPages || 1, 1);

  const attentionCount = useMemo(() => {
    return users.filter(
      (
        user: {
          attention?: {
            required?: boolean;
          };
        },
      ) => user.attention?.required,
    ).length;
  }, [users]);

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.role !== 'all';

  const updateFilter = (
    key: keyof typeof defaultFilters,
    value: string,
  ) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));

    setPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-7xl
        min-w-0
        space-y-6
        pb-8
        sm:space-y-8
      "
    >
      {/* Hero */}

      <motion.section
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-gradient-to-br
          from-primary/[0.11]
          via-card
          to-card
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-64
            w-64
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-primary/15
                text-primary
                shadow-sm
              "
            >
              <Users className="h-7 w-7" />
            </div>

            <div>
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-primary
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Directory
              </span>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                  sm:text-3xl
                "
              >
                Users
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-muted-foreground
                  sm:text-base
                "
              >
                Manage accounts, subscriptions, payments,
                access, and user activity from one place.
              </p>
            </div>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-border
                bg-background/70
                px-4
                py-3
                backdrop-blur
              "
            >
              <p className="text-xs text-muted-foreground">
                Current Page
              </p>

              <p className="mt-1 text-lg font-black text-primary">
                {loading ? '...' : users.length}
              </p>
            </div>

            {attentionCount > 0 && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-destructive/25
                  bg-destructive/10
                  px-4
                  py-3
                  text-sm
                  text-destructive
                "
              >
                <AlertTriangle className="h-5 w-5" />

                <div>
                  <p className="font-semibold">
                    Attention Required
                  </p>

                  <p className="mt-0.5 text-xs">
                    {attentionCount} user
                    {attentionCount === 1 ? '' : 's'} need review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Filters */}

      <motion.section
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="
          rounded-3xl
          border
          border-border
          bg-card
          p-4
          shadow-sm
          sm:p-5
        "
      >
        <div
          className="
            mb-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary/10
                text-primary
              "
            >
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold">
                Filter Directory
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Search users by name, email, role, or account status.
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                inline-flex
                h-10
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-border
                px-3
                text-xs
                font-semibold
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
              "
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div
          className="
            grid
            gap-3
            sm:grid-cols-2
            xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)]
          "
        >
          <label className="block">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Search
            </span>

            <div className="relative mt-2">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                placeholder="Name, email, or username..."
                value={filters.search}
                onChange={(event) =>
                  updateFilter(
                    'search',
                    event.target.value,
                  )
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-input
                  bg-background
                  pl-10
                  pr-4
                  text-sm
                  outline-none
                  transition
                  placeholder:text-muted-foreground
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              />
            </div>
          </label>

          <label className="block">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Status
            </span>

            <div className="relative mt-2">
              <Filter
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <select
                value={filters.status}
                onChange={(event) =>
                  updateFilter(
                    'status',
                    event.target.value,
                  )
                }
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-input
                  bg-background
                  pl-10
                  pr-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="suspended">
                  Suspended
                </option>

                <option value="deleted">
                  Deleted
                </option>
              </select>
            </div>
          </label>

          <label className="block">
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Role
            </span>

            <div className="relative mt-2">
              <ShieldCheck
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <select
                value={filters.role}
                onChange={(event) =>
                  updateFilter(
                    'role',
                    event.target.value,
                  )
                }
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-input
                  bg-background
                  pl-10
                  pr-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              >
                <option value="all">
                  All Roles
                </option>

                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </div>
          </label>
        </div>
      </motion.section>

      {/* Table */}

      <motion.section
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card
          shadow-sm
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-4
            py-4
            sm:px-5
          "
        >
          <div>
            <h2 className="font-bold">
              User Directory
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? 'Loading users...'
                : `${users.length} user${
                    users.length === 1 ? '' : 's'
                  } shown on this page`}
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-primary/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-primary
            "
          >
            Page {page}
          </span>
        </div>

        <UsersTable
          users={users}
          loading={loading}
        />
      </motion.section>

      {/* Pagination */}

      <nav
        aria-label="User list pagination"
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-border
          bg-card
          p-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Page{' '}
          <span className="font-semibold text-foreground">
            {page}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-foreground">
            {safeTotalPages}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage((currentPage) =>
                Math.max(1, currentPage - 1),
              )
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-border
              px-4
              text-sm
              font-semibold
              transition
              hover:bg-muted
              disabled:pointer-events-none
              disabled:opacity-40
            "
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            type="button"
            disabled={
              page >= safeTotalPages || loading
            }
            onClick={() =>
              setPage((currentPage) =>
                Math.min(
                  safeTotalPages,
                  currentPage + 1,
                ),
              )
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-border
              px-4
              text-sm
              font-semibold
              transition
              hover:bg-muted
              disabled:pointer-events-none
              disabled:opacity-40
            "
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </main>
  );
}
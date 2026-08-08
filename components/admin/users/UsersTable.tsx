'use client';

import {
  useRouter,
} from 'next/navigation';

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Crown,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

interface UserRecord {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  role: string;
  isVip?: boolean;

  attention?: {
    required?: boolean;
    count?: number;
  };
}

interface UsersTableProps {
  users: UserRecord[];
  loading: boolean;
}

function getInitials(name?: string) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getStatusClasses(status: string) {
  if (status === 'active') {
    return 'bg-emerald-500/10 text-emerald-600';
  }

  if (status === 'suspended') {
    return 'bg-amber-500/10 text-amber-600';
  }

  if (status === 'pending') {
    return 'bg-blue-500/10 text-blue-600';
  }

  return 'bg-destructive/10 text-destructive';
}

function getRoleDetails(user: UserRecord) {
  if (user.role === 'admin') {
    return {
      label: 'Admin',
      icon: <ShieldCheck className="h-4 w-4 text-primary" />,
      classes: 'text-foreground',
    };
  }

  if (user.isVip) {
    return {
      label: 'VIP',
      icon: <Crown className="h-4 w-4 text-yellow-500" />,
      classes: 'text-foreground',
    };
  }

  return {
    label: 'User',
    icon: <UserRound className="h-4 w-4 text-muted-foreground" />,
    classes: 'text-muted-foreground',
  };
}

export default function UsersTable({
  users,
  loading,
}: UsersTableProps) {
  const router = useRouter();

  const openUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4 sm:p-5">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-20
              animate-pulse
              rounded-2xl
              border
              border-border
              bg-muted/40
            "
          />
        ))}
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div
        className="
          flex
          min-h-[320px]
          flex-col
          items-center
          justify-center
          p-6
          text-center
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-muted
            text-muted-foreground
          "
        >
          <UserRound className="h-8 w-8" />
        </div>

        <h3 className="mt-5 font-bold">
          No users found
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Try changing your filters or search terms to find
          the users you need.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}

      <div className="space-y-3 p-3 lg:hidden">
        {users.map((user) => {
          const role = getRoleDetails(user);

          return (
            <button
              key={user._id}
              type="button"
              onClick={() => openUser(user._id)}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-background
                p-4
                text-left
                shadow-sm
                transition
                active:scale-[0.99]
              "
            >
              <div className="flex items-start gap-3">
                <Avatar
                  name={user.fullName}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {user.fullName}
                      </p>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <span
                      className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        capitalize
                        ${getStatusClasses(user.status)}
                      `}
                    >
                      {user.status}
                    </span>

                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-muted
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        ${role.classes}
                      `}
                    >
                      {role.icon}
                      {role.label}
                    </span>

                    {user.attention?.required ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-destructive/10
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-destructive
                        "
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />

                        {user.attention.count || 1} issue
                        {(user.attention.count || 1) > 1
                          ? 's'
                          : ''}
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-xs
                          text-emerald-600
                        "
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Healthy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}

      <div className="hidden overflow-hidden lg:block">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
          </colgroup>

          <thead
            className="
              border-b
              border-border
              bg-muted/40
            "
          >
            <tr>
              <TableHeader>User</TableHeader>
              <TableHeader>Attention</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Role</TableHeader>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const role = getRoleDetails(user);

              return (
                <tr
                  key={user._id}
                  tabIndex={0}
                  role="button"
                  onClick={() => openUser(user._id)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault();
                      openUser(user._id);
                    }
                  }}
                  className="
                    group
                    cursor-pointer
                    border-b
                    border-border/70
                    outline-none
                    transition-colors
                    last:border-0
                    hover:bg-primary/[0.04]
                    focus-visible:bg-primary/[0.06]
                  "
                >
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={user.fullName} />

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {user.fullName}
                        </p>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {user.attention?.required ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-destructive/25
                          bg-destructive/10
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          text-destructive
                        "
                      >
                        <span
                          className="
                            h-1.5
                            w-1.5
                            animate-pulse
                            rounded-full
                            bg-destructive
                          "
                        />

                        {user.attention.count || 1} issue
                        {(user.attention.count || 1) > 1
                          ? 's'
                          : ''}
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-xs
                          font-semibold
                          text-emerald-600
                        "
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Healthy
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        capitalize
                        ${getStatusClasses(user.status)}
                      `}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        ${role.classes}
                      `}
                    >
                      {role.icon}
                      {role.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Avatar({
  name,
}: {
  name: string;
}) {
  return (
    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-primary/10
        text-xs
        font-bold
        text-primary
      "
    >
      {getInitials(name)}
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      className="
        px-4
        py-4
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-muted-foreground
        first:px-5
        last:px-5
      "
    >
      {children}
    </th>
  );
}
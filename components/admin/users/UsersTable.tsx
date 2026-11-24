'use client';

import { useRouter } from 'next/navigation';
import type { AdminUser } from '@/types/users';

type Props = { users: AdminUser[]; loading?: boolean };

const statusStyle: Record<string, string> = {
  active: 'bg-emerald-500/10 text-status-success',
  suspended: 'bg-amber-500/10 text-status-warning',
  deleted: 'bg-red-500/10 text-status-danger',
};

function initials(value = '') {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || 'U';
}

export default function UsersTable({ users, loading = false }: Props) {
  const router = useRouter();
  if (loading && !users.length) return <div className="p-5 text-sm text-muted-foreground">Loading…</div>;
  if (!users.length) return <div className="p-8 text-center text-sm text-muted-foreground">No users found</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {['User', 'Plan', 'Status', 'Role', 'Verified', 'Joined'].map((label) => (
              <th key={label} className="px-3 py-2.5 font-semibold">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {users.map((user) => (
            <tr key={user._id} onClick={() => router.push(`/admin/users/${user._id}`)} tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter') router.push(`/admin/users/${user._id}`); }}
              className="cursor-pointer outline-none hover:bg-muted/30 focus-visible:bg-muted/50">
              <td className="px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-brand-accent">{initials(user.fullName)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{user.fullName || user.username || '—'}</span>
                    <span className="block max-w-[240px] truncate text-xs text-muted-foreground">{user.email || '—'}</span>
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5 capitalize">{'—'}</td>
              <td className="px-3 py-2.5"><span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyle[String(user.status)] ?? 'bg-muted text-muted-foreground'}`}>{String(user.status ?? 'unknown')}</span></td>
              <td className="px-3 py-2.5 capitalize">{String(user.role ?? 'user')}</td>
              <td className="px-3 py-2.5">{user.isVerified ? 'Yes' : 'No'}</td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




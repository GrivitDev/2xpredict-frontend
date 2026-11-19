'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const GROUPS = [
  { label: 'Core', links: [
    { href: '/admin', label: 'Control' },
    { href: '/admin/analytics', label: 'Business' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/subscriptions', label: 'Plans & payments' },
    { href: '/admin/bonuses', label: 'Bonuses' },
    { href: '/admin/promos', label: 'Promos' },
    { href: '/admin/referrals', label: 'Referrals' },
    { href: '/admin/ads', label: 'Ads' },
    { href: '/admin/internal-ads', label: 'House ads' },
    { href: '/admin/website-analytics', label: 'Web analytics' },
  ] },
  { label: 'Match ops', links: [
    { href: '/admin/system-monitor', label: 'System' },
    { href: '/admin/sports', label: 'Sports data' },
    { href: '/admin/odds-center', label: 'Odds' },
    { href: '/admin/predictions-engine', label: 'Predictions' },
    { href: '/admin/settlement', label: 'Settlement' },
    { href: '/admin/bet-lab', label: 'Bet Lab' },
  ] },
  { label: 'Support', links: [
    { href: '/admin/customer-care', label: 'Customer care' },
  ] },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Admin modules" className="mb-3 rounded-lg border border-border/80 bg-card/95 px-1.5 py-1.5 shadow-sm">
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
      {GROUPS.map((group, groupIndex) => <div key={group.label} className={`flex shrink-0 items-center gap-1 ${groupIndex ? 'border-l border-border/80 pl-2' : ''}`}>
        <span className="hidden px-1 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground 2xl:inline">{group.label}</span>
        {group.links.map((item) => {
          const active = item.href === '/admin' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors sm:px-2.5 ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {item.label}
          </Link>;
        })}
      </div>)}
    </div>
  </nav>;
}

export function AdminPageFrame({ title, description, badge, actions, children, className = '' }: {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return <main className={`mx-auto w-full min-w-0 max-w-[1680px] space-y-2.5 px-0 pb-5 ${className}`}>
    <header className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-gradient-to-r from-card via-card to-primary/[0.055] px-3 py-2 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{title}</h1>{badge}</div>
        {description && <p className="mt-0.5 max-w-4xl text-[10px] leading-4 text-muted-foreground sm:text-[11px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div>}
    </header>
    <div className="min-w-0 space-y-2.5">{children}</div>
  </main>;
}

export const adminButton = 'inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2.5 text-[10px] font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 sm:text-[11px]';
export const adminPrimaryButton = 'inline-flex h-7 items-center justify-center rounded-md border border-primary/80 bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 sm:text-[11px]';
export const adminDangerButton = 'inline-flex h-7 items-center justify-center rounded-md border border-destructive/30 bg-destructive/[0.06] px-2.5 text-[10px] font-semibold text-destructive transition-colors hover:bg-destructive/[0.12] disabled:pointer-events-none disabled:opacity-50 sm:text-[11px]';
export const adminInput = 'h-7 w-full min-w-0 rounded-md border border-border bg-background px-2 text-[11px] outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10';
export const adminTextarea = 'min-h-16 w-full min-w-0 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10';
export const adminPanel = 'min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.025)]';
export const adminPanelHeading = 'flex min-h-8 items-center justify-between gap-2 border-b border-border/70 px-2.5 py-1.5';

export function AdminMetric({ label, value, foot, tone = 'default' }: { label: string; value: ReactNode; foot?: string; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const toneClass = tone === 'good' ? 'border-emerald-500/20 bg-emerald-500/[0.035]' : tone === 'warn' ? 'border-amber-500/25 bg-amber-500/[0.035]' : tone === 'bad' ? 'border-destructive/25 bg-destructive/[0.035]' : 'border-border/80 bg-card';
  return <div className={`min-w-0 rounded-lg border px-2.5 py-2 ${toneClass}`}><div className="truncate text-[9px] font-semibold uppercase tracking-[0.09em] text-muted-foreground sm:text-[10px]">{label}</div><div className="mt-1 truncate text-base font-semibold leading-tight tracking-tight tabular-nums sm:text-lg" title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}>{value ?? '—'}</div>{foot && <div className="mt-0.5 truncate text-[9px] text-muted-foreground">{foot}</div>}</div>;
}

export function AdminMetrics({ items, columns = 4 }: { items: Array<{ label: string; value: ReactNode; foot?: string; tone?: 'default' | 'good' | 'warn' | 'bad' }>; columns?: 2 | 3 | 4 | 5 | 6 }) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4', 5: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5', 6: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6' }[columns];
  return <section className={`grid ${grid} gap-1.5`}>{items.map((item) => <AdminMetric key={item.label} {...item} />)}</section>;
}

export function AdminPanel({ title, meta, actions, children, className = '' }: { title: string; meta?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`${adminPanel} ${className}`}><div className={adminPanelHeading}><div className="flex min-w-0 items-center gap-2"><h2 className="truncate text-[11px] font-semibold sm:text-xs">{title}</h2>{meta && <span className="text-[9px] text-muted-foreground">{meta}</span>}</div>{actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}</div>{children}</section>;
}

export function AdminTabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (tab: T) => void; tabs: Array<{ value: T; label: string; count?: ReactNode }> }) {
  return <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg border border-border/80 bg-muted/30 p-1">{tabs.map((tab) => <button type="button" role="tab" aria-selected={value === tab.value} key={tab.value} onClick={() => onChange(tab.value)} className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors sm:text-[11px] ${value === tab.value ? 'bg-background text-foreground shadow-sm ring-1 ring-border/70' : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'}`}>{tab.label}{tab.count !== undefined && <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] tabular-nums">{tab.count}</span>}</button>)}</div>;
}

export type AdminColumn<T extends Record<string, unknown> = Record<string, unknown>> = { key: string; label?: string; render?: (row: T) => ReactNode; className?: string };

export function rowsFrom(value: unknown, keys: string[] = ['items', 'data', 'results', 'rows', 'records', 'events', 'jobs', 'runs', 'users', 'referrals', 'predictions', 'slips', 'tickets', 'collections', 'modules', 'crons', 'recent', 'recentEvents', 'recentJobs', 'recentRuns', 'recentWarningsAndErrors', 'errors', 'activities', 'snapshots', 'fixtures', 'leagues', 'teams', 'standings', 'conversations', 'incidents', 'broadcasts', 'operations', 'entries', 'records']): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object').map((item) => item as Record<string, unknown>);
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  for (const key of keys) if (Array.isArray(record[key])) return (record[key] as unknown[]).filter((item) => item && typeof item === 'object').map((item) => item as Record<string, unknown>);
  for (const [key, nested] of Object.entries(record)) {
    if (nested && typeof nested === 'object' && !Array.isArray(nested) && ['data', 'result', 'payload'].includes(key)) {
      const found = rowsFrom(nested, keys);
      if (found.length) return found;
    }
  }
  const genericArray = Object.values(record).find((entry) => Array.isArray(entry) && entry.some((item) => item && typeof item === 'object'));
  return Array.isArray(genericArray) ? genericArray.filter((item) => item && typeof item === 'object').map((item) => item as Record<string, unknown>) : [];
}

export function getField(row: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, row);
}

export function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString() : '—';
  if (Array.isArray(value)) return value.length === 0 ? '—' : `${value.length} items`;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of ['name', 'title', 'status', 'label', 'displayName', 'fullName', 'message', 'email', 'username', 'eventId', 'jobKey', '_id', 'id']) if (obj[key] != null && typeof obj[key] !== 'object') return String(obj[key]);
    return '{…}';
  }
  return String(value);
}

export function AdminTable<T extends Record<string, unknown> = Record<string, unknown>>({ rows, columns, empty = 'No records available.', limit = 50, rowKey }: { rows: T[]; columns: Array<AdminColumn<T>>; empty?: string; limit?: number; rowKey?: (row: T, index: number) => string }) {
  return rows.length ? <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left text-[10px] sm:text-[11px]"><thead className="sticky top-0 z-[1] bg-muted/70 text-[9px] uppercase tracking-[0.06em] text-muted-foreground"><tr>{columns.map((column) => <th key={column.key} className={`whitespace-nowrap px-2.5 py-2 font-semibold ${column.className ?? ''}`}>{column.label ?? column.key.replaceAll('.', ' ')}</th>)}</tr></thead><tbody className="divide-y divide-border/60">{rows.slice(0, limit).map((row, index) => <tr key={rowKey?.(row, index) ?? String(row._id ?? row.id ?? index)} className="transition-colors hover:bg-muted/20">{columns.map((column) => { const value = column.render ? column.render(row) : displayValue(getField(row, column.key)); return <td key={column.key} title={typeof value === 'string' ? value : undefined} className={`max-w-[260px] px-2.5 py-1.5 align-top ${column.className ?? ''}`}><div className="line-clamp-2 break-words">{value as ReactNode}</div></td>; })}</tr>)}</tbody></table>{rows.length > limit && <p className="border-t border-border/60 px-2.5 py-1.5 text-[9px] text-muted-foreground">Showing {limit.toLocaleString()} of {rows.length.toLocaleString()} loaded records.</p>}</div> : <div className="px-3 py-5 text-center text-[11px] text-muted-foreground">{empty}</div>;
}

export function AdminNotice({ kind = 'info', children, action }: { kind?: 'info' | 'error' | 'success' | 'warning'; children: ReactNode; action?: ReactNode }) {
  const styles = { info: 'border-border bg-muted/25 text-muted-foreground', error: 'border-destructive/30 bg-destructive/5 text-destructive', success: 'border-emerald-600/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300', warning: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200' };
  return <div className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-[10px] ${styles[kind]}`} role={kind === 'error' ? 'alert' : 'status'}><span>{children}</span>{action}</div>;
}

export function AdminError({ error, retry }: { error: unknown; retry?: () => unknown }) {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'The request failed.';
  return <AdminNotice kind="error" action={retry && <button type="button" className={adminButton} onClick={() => void retry()}>Retry</button>}>{message}</AdminNotice>;
}

export function AdminLoading({ label = 'Loading data…' }: { label?: string }) {
  return <div className="flex min-h-20 items-center justify-center gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-6 text-[11px] text-muted-foreground"><span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />{label}</div>;
}

export function compactDate(value: unknown): string {
  if (!value) return '—';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function compactStatus(value: unknown): ReactNode {
  const text = String(value ?? 'UNKNOWN');
  const upper = text.toUpperCase();
  const tone = /FAIL|ERROR|CRITICAL|REJECT|LOST|CANCEL/.test(upper) ? 'bg-destructive/10 text-destructive' : /DEGRAD|WARN|PENDING|RETRY|OPEN|PARTIAL|PROCESS/.test(upper) ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : /HEALTHY|ONLINE|SUCCESS|COMPLET|ACTIVE|WON|PUBLISHED|APPROVED|READY|RESOLVED/.test(upper) ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground';
  return <span className={`inline-flex max-w-full items-center rounded px-1.5 py-0.5 text-[9px] font-semibold ${tone}`}>{text.replaceAll('_', ' ')}</span>;
}

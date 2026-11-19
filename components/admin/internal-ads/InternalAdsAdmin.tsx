'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateMutation,
  useFindAllQuery,
  useRemoveMutation,
  useUpdateMutation,
} from '@/hooks/use-internal-ads';
import {
  errorMessage,
  firstValue,
  rowsFrom,
  text,
  formatDate,
} from '@/lib/api-shapes';
import SectionHeader from '@/components/shared/SectionHeader';

type Placement = 'WEB' | 'TELEGRAM';

type InternalAdRow = Record<string, any> & {
  _id?: string;
  id?: string;
  title?: string;
  displayLevel?: string;
  placements?: Placement[];
  isActive?: boolean;
};

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal';
const textareaClass =
  'mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal';

export default function InternalAdsAdmin() {
  const queryClient = useQueryClient();
  const query = useFindAllQuery<unknown>({ refetchInterval: 30_000 });
  const create = useCreateMutation<unknown>();
  const update = useUpdateMutation<unknown>();
  const remove = useRemoveMutation<unknown>();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionLabel, setActionLabel] = useState('Explore 2xPredict');
  const [actionUrl, setActionUrl] = useState('/promos');
  const [level, setLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [placements, setPlacements] = useState<Placement[]>(['WEB']);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const rows = rowsFrom(query.data, ['items', 'ads', 'results', 'data']) as InternalAdRow[];

  function togglePlacement(placement: Placement) {
    setPlacements((current) =>
      current.includes(placement)
        ? current.filter((item) => item !== placement)
        : [...current, placement],
    );
  }

  async function createAd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!title.trim()) {
      setError('Enter an ad title.');
      return;
    }
    if (!placements.length) {
      setError('Select at least one placement.');
      return;
    }

    try {
      await create.mutateAsync({
        body: {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          message: message.trim() || undefined,
          displayLevel: level,
          placements,
          actions: actionUrl.trim()
            ? [{
                label: actionLabel.trim() || 'Explore 2xPredict',
                url: actionUrl.trim(),
              }]
            : undefined,
          isActive: true,
        },
      });

      setTitle('');
      setSubtitle('');
      setMessage('');
      setActionLabel('Explore 2xPredict');
      setActionUrl('/promos');
      setLevel('medium');
      setPlacements(['WEB']);
      setNotice('Internal ad created.');
      await queryClient.invalidateQueries({ queryKey: ['internal-ads'] });
      await query.refetch();
    } catch (cause) {
      setError(errorMessage(cause, 'Unable to create internal ad.'));
    }
  }

  async function toggleAd(item: InternalAdRow) {
    const id = text(firstValue(item, ['_id', 'id']));
    if (!id) return;
    setError('');
    setNotice('');
    try {
      await update.mutateAsync({
        path: { id },
        body: { isActive: item.isActive === false },
      });
      setNotice('Ad status updated.');
      await query.refetch();
    } catch (cause) {
      setError(errorMessage(cause, 'Unable to update ad.'));
    }
  }

  async function deleteAd(item: InternalAdRow) {
    const id = text(firstValue(item, ['_id', 'id']));
    if (!id || !window.confirm('Delete this internal ad?')) return;
    setError('');
    setNotice('');
    try {
      await remove.mutateAsync({ path: { id } });
      setNotice('Ad deleted.');
      await query.refetch();
    } catch (cause) {
      setError(errorMessage(cause, 'Unable to delete ad.'));
    }
  }

  return (
    <main className="mx-auto max-w-[1350px] space-y-4 px-4 py-5 sm:px-6">
      <SectionHeader
        eyebrow="Administration"
        title="Internal ads"
        description="Manage platform-owned campaigns for the website and the public Telegram channel."
        action={
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            Refresh
          </button>
        }
      />

      {notice ? (
        <p role="status" className="rounded-lg bg-emerald-500/10 p-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="h-fit rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Create an internal ad</h2>
          <form onSubmit={createAd} className="mt-4 space-y-3">
            <label className="block text-xs font-semibold">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={120}
                className={inputClass}
              />
            </label>

            <label className="block text-xs font-semibold">
              Subtitle (optional)
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                maxLength={180}
                className={inputClass}
              />
            </label>

            <label className="block text-xs font-semibold">
              Message (optional)
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                maxLength={1200}
                className={textareaClass}
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-semibold">Where should this ad appear?</p>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={placements.includes('WEB')}
                  onChange={() => togglePlacement('WEB')}
                />
                <span>Website placements</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={placements.includes('TELEGRAM')}
                  onChange={() => togglePlacement('TELEGRAM')}
                />
                <span>Public Telegram channel</span>
              </label>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Telegram publishes one active campaign per day, rotating through eligible ads. Telegram posts use the shared /banner.png image.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold">
                Button label
                <input
                  value={actionLabel}
                  onChange={(event) => setActionLabel(event.target.value)}
                  maxLength={64}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs font-semibold">
                Button destination
                <input
                  value={actionUrl}
                  onChange={(event) => setActionUrl(event.target.value)}
                  maxLength={2048}
                  placeholder="/promos"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold">
              Display priority
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as typeof level)}
                className={inputClass}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={create.isPending || placements.length === 0}
              className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create ad'}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Existing ads</h2>
          </div>
          {query.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading ads…</p>
          ) : rows.length ? (
            <div className="divide-y divide-border">
              {rows.map((item, index) => {
                const id = text(firstValue(item, ['_id', 'id']), String(index));
                const targets = Array.isArray(item.placements)
                  ? item.placements
                  : ['WEB'];
                return (
                  <div key={id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {text(item.title, 'Untitled ad')}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {text(item.displayLevel, 'medium')} priority · Updated{' '}
                        {formatDate(firstValue(item, ['updatedAt', 'createdAt']))}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {targets.map((target: string) => (
                          <span
                            key={target}
                            className="rounded-full border border-border px-2 py-0.5 text-[9px] font-semibold text-muted-foreground"
                          >
                            {target === 'TELEGRAM' ? 'TELEGRAM' : 'WEB'}
                          </span>
                        ))}
                        {item.lastTelegramSentAt ? (
                          <span className="text-[9px] text-muted-foreground">
                            Last Telegram post: {formatDate(item.lastTelegramSentAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          item.isActive === false
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-emerald-500/10 text-emerald-700'
                        }`}
                      >
                        {item.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                      <button
                        type="button"
                        disabled={update.isPending}
                        onClick={() => void toggleAd(item)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium"
                      >
                        {item.isActive === false ? 'Activate' : 'Pause'}
                      </button>
                      <button
                        type="button"
                        disabled={remove.isPending}
                        onClick={() => void deleteAd(item)}
                        className="rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No internal ads configured.</p>
          )}
        </section>
      </div>
    </main>
  );
}

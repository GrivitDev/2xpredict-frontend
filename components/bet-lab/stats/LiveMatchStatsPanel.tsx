'use client';

import { useMemo, useState } from 'react';
import { FaChartSimple, FaClockRotateLeft, FaFutbol } from 'react-icons/fa6';
import type { ComparisonStat, TeamStatsProfile } from './stats.types';
import StatsTeamBadge from './StatsTeamBadge';

type Category = 'all' | ComparisonStat['category'];

const FILTERS: Array<{ id: Category; label: string; icon: typeof FaChartSimple }> = [
  { id: 'all', label: 'All', icon: FaChartSimple },
  { id: 'attack', label: 'Attack', icon: FaFutbol },
  { id: 'possession', label: 'Possession', icon: FaFutbol },
  { id: 'defence', label: 'Defence', icon: FaClockRotateLeft },
  { id: 'discipline', label: 'Discipline', icon: FaClockRotateLeft },
];

function LiveStatRow({ stat }: { stat: ComparisonStat }) {
  const max = Math.max(stat.homeNumber ?? 0, stat.awayNumber ?? 0, 1);
  const homeWidth = ((stat.homeNumber ?? 0) / max) * 100;
  const awayWidth = ((stat.awayNumber ?? 0) / max) * 100;
  return (
    <div className="border-b border-border/50 py-1 last:border-b-0">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 tabular-nums">
        <strong className="text-left text-[9px] font-black text-primary">{stat.home}</strong>
        <span className="text-center text-[7px] font-bold text-muted-foreground sm:text-[8px]">{stat.label}</span>
        <strong className="text-right text-[9px] font-black text-sky-600 dark:text-sky-400">{stat.away}</strong>
      </div>
      {stat.homeNumber !== null || stat.awayNumber !== null ? (
        <div className="mt-1 grid grid-cols-2 gap-1.5">
          <div className="flex h-1 justify-end overflow-hidden rounded-full bg-muted/80">
            <span className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${homeWidth}%` }} />
          </div>
          <div className="flex h-1 overflow-hidden rounded-full bg-muted/80">
            <span className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${awayWidth}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function LiveMatchStatsPanel({ home, away, stats, loading = false }: {
  home: TeamStatsProfile;
  away: TeamStatsProfile;
  stats: ComparisonStat[];
  loading?: boolean;
}) {
  const [category, setCategory] = useState<Category>('all');
  const filtered = useMemo(() => category === 'all' ? stats : stats.filter((stat) => stat.category === category), [category, stats]);

  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <FaChartSimple className="h-2.5 w-2.5 text-primary" />
        <h3 className="text-[10px] font-extrabold">Match statistics</h3>
      </div>
      <div className="mb-1.5 grid grid-cols-2 items-center gap-2 border-b border-border/60 pb-1.5">
        <StatsTeamBadge team={home} compact />
        <StatsTeamBadge team={away} compact align="right" />
      </div>

      <div className="mb-1.5 flex gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label="Match statistics categories">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            onClick={() => setCategory(id)}
            className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-1.5 text-[7px] font-bold transition ${category === id ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/60 bg-background/60 text-muted-foreground hover:bg-muted'}`}
          >
            <Icon className="h-2.5 w-2.5" />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 py-1.5">{[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-6 animate-pulse rounded-md bg-muted/70" />)}</div>
      ) : filtered.length ? (
        <div>{filtered.map((stat) => <LiveStatRow key={stat.key} stat={stat} />)}</div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/70 px-2 py-4 text-center text-[8px] text-muted-foreground">
          {stats.length ? 'No statistics in this category.' : 'Match statistics are not available yet.'}
        </div>
      )}
    </section>
  );
}



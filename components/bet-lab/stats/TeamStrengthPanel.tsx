'use client';

import { FaChartSimple, FaClockRotateLeft, FaFutbol } from 'react-icons/fa6';
import type { TeamStatsProfile } from './stats.types';
import StatsTeamBadge from './StatsTeamBadge';

const ITEMS: Array<{ key: keyof TeamStatsProfile['strength']; label: string; icon: typeof FaChartSimple }> = [
  { key: 'season', label: 'Season', icon: FaChartSimple },
  { key: 'form', label: 'Form', icon: FaClockRotateLeft },
  { key: 'attack', label: 'Attack', icon: FaFutbol },
  { key: 'defence', label: 'Defence', icon: FaChartSimple },
];

export default function TeamStrengthPanel({ home, away }: { home: TeamStatsProfile; away: TeamStatsProfile }) {
  const homeScore = home.overallStrength;
  const awayScore = away.overallStrength;
  const hasBoth = homeScore !== null && awayScore !== null;
  const total = hasBoth ? homeScore + awayScore : 0;
  const homeWidth = total > 0 ? (homeScore! / total) * 100 : 50;

  return (
    <section className="overflow-hidden rounded-lg border border-border/70 bg-gradient-to-br from-primary/[0.08] via-card to-sky-500/[0.07] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-extrabold">Overall strength</h3>
        <span className="rounded-md border border-border/70 bg-background/70 px-1.5 py-0.5 text-[7px] font-bold text-muted-foreground">SCORE / 100</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
        <div className="min-w-0">
          <StatsTeamBadge team={home} compact />
          <div className="mt-1 flex items-baseline gap-1">
            <strong className="text-xl font-black leading-none tracking-tight tabular-nums text-primary">{homeScore === null ? '—' : homeScore}</strong>
            <span className="text-[7px] font-bold text-muted-foreground">/100</span>
          </div>
        </div>
        <span className="text-[7px] font-black tracking-[0.14em] text-muted-foreground/70">VS</span>
        <div className="min-w-0 text-right">
          <div className="flex justify-end"><StatsTeamBadge team={away} compact align="right" /></div>
          <div className="mt-1 flex items-baseline justify-end gap-1">
            <strong className="text-xl font-black leading-none tracking-tight tabular-nums text-sky-600 dark:text-sky-400">{awayScore === null ? '—' : awayScore}</strong>
            <span className="text-[7px] font-bold text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted/80">
        {hasBoth ? <><span className="h-full bg-primary transition-[width] duration-700" style={{ width: `${homeWidth}%` }} /><span className="h-full flex-1 bg-sky-500 transition-[width] duration-700" /></> : <span className="h-full w-full bg-muted-foreground/15" />}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const homeValue = home.strength[key];
          const awayValue = away.strength[key];
          return (
            <div key={key} className="min-w-0 rounded-md border border-border/55 bg-background/65 px-1 py-1 text-center">
              <div className="flex items-center justify-center gap-1 text-[7px] font-bold text-muted-foreground"><Icon className="h-2 w-2" />{label}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-black tabular-nums">
                <span className="text-primary">{homeValue === null ? '—' : Math.round(homeValue)}</span>
                <span className="text-muted-foreground/50">:</span>
                <span className="text-sky-600 dark:text-sky-400">{awayValue === null ? '—' : Math.round(awayValue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


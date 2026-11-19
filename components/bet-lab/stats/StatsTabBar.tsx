'use client';

import { FaChartSimple, FaClockRotateLeft, FaFutbol } from 'react-icons/fa6';
import type { FixtureStatsTab } from './stats.types';

const BASE_TABS: Array<{ id: FixtureStatsTab; label: string; icon: typeof FaChartSimple }> = [
  { id: 'overview', label: 'Overview', icon: FaChartSimple },
  { id: 'form', label: 'Form', icon: FaClockRotateLeft },
  { id: 'season', label: 'Season', icon: FaFutbol },
  { id: 'h2h', label: 'H2H', icon: FaClockRotateLeft },
];

export default function StatsTabBar({ active, onChange, showLive }: {
  active: FixtureStatsTab;
  onChange: (tab: FixtureStatsTab) => void;
  showLive: boolean;
}) {
  const tabs = showLive ? [...BASE_TABS, { id: 'live' as const, label: 'Match', icon: FaFutbol }] : BASE_TABS;
  return (
    <div className="flex gap-0.5 overflow-x-auto border-b border-border/70 px-2 pt-1 scrollbar-none sm:px-3" role="tablist" aria-label="Match statistics sections">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={`inline-flex min-h-7 shrink-0 items-center gap-1 rounded-t-md border-b-2 px-2 text-[8px] font-bold transition sm:px-2.5 sm:text-[9px] ${active === id ? 'border-primary bg-primary/[0.06] text-primary' : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
        >
          <Icon className="h-2 w-2" />{label}
        </button>
      ))}
    </div>
  );
}



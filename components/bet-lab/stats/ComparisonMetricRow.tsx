'use client';

import { formatStat } from './fixture-stats.utils';

type Props = {
  label: string;
  home: number | null;
  away: number | null;
  suffix?: string;
  decimals?: number;
  lowerIsBetter?: boolean;
  compact?: boolean;
};

export default function ComparisonMetricRow({
  label,
  home,
  away,
  suffix = '',
  decimals = 1,
  lowerIsBetter = false,
  compact = false,
}: Props) {
  const valid = home !== null || away !== null;
  const homeValue = home === null ? null : lowerIsBetter ? 1 / (1 + Math.max(home, 0)) : Math.max(home, 0);
  const awayValue = away === null ? null : lowerIsBetter ? 1 / (1 + Math.max(away, 0)) : Math.max(away, 0);
  const total = (homeValue ?? 0) + (awayValue ?? 0);
  const homeWidth = total > 0 ? ((homeValue ?? 0) / total) * 100 : 50;
  const awayWidth = total > 0 ? ((awayValue ?? 0) / total) * 100 : 50;
  const homeLeads = homeValue !== null && awayValue !== null && homeValue > awayValue;
  const awayLeads = homeValue !== null && awayValue !== null && awayValue > homeValue;

  return (
    <div className={`${compact ? 'py-1' : 'py-1.5'} border-b border-border/45 last:border-b-0`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 tabular-nums">
        <strong className={`text-left text-[9px] font-black sm:text-[10px] ${homeLeads ? 'text-primary' : 'text-foreground/85'}`}>{formatStat(home, suffix, decimals)}</strong>
        <span className="max-w-[120px] text-center text-[7px] font-bold text-muted-foreground sm:text-[8px]">{label}</span>
        <strong className={`text-right text-[9px] font-black sm:text-[10px] ${awayLeads ? 'text-sky-600 dark:text-sky-400' : 'text-foreground/85'}`}>{formatStat(away, suffix, decimals)}</strong>
      </div>
      {valid ? (
        <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-muted/80">
          <span className="h-full rounded-l-full bg-primary transition-[width] duration-500" style={{ width: `${homeWidth}%` }} />
          <span className="h-full rounded-r-full bg-sky-500 transition-[width] duration-500" style={{ width: `${awayWidth}%` }} />
        </div>
      ) : null}
    </div>
  );
}


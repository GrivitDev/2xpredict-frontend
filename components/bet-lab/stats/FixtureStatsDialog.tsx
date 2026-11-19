'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaChartSimple, FaRotateRight, FaXmark } from 'react-icons/fa6';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
import { asRecord, type ApiRecord } from '@/lib/api-shapes';
import { useFixtureStats } from './use-fixture-stats';
import useBetLabScrollLock from '../use-bet-lab-scroll-lock';
import StatsTeamBadge from './StatsTeamBadge';
import StatsTabBar from './StatsTabBar';
import StatsOverviewPanel from './StatsOverviewPanel';
import TeamFormPanel from './TeamFormPanel';
import SeasonComparisonPanel from './SeasonComparisonPanel';
import HeadToHeadPanel from './HeadToHeadPanel';
import LiveMatchStatsPanel from './LiveMatchStatsPanel';
import type { FixtureStatsTab } from './stats.types';

type Props = {
  open: boolean;
  fixture: ApiRecord;
  presentation?: MatchPresentation;
  onClose: () => void;
};

function LoadingState() {
  return (
    <div className="space-y-1.5">
      <div className="h-28 animate-pulse rounded-lg bg-muted/70" />
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-lg bg-muted/70" />
        <div className="h-28 animate-pulse rounded-lg bg-muted/70" />
      </div>
    </div>
  );
}

export default function FixtureStatsDialog({ open, fixture, presentation, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<FixtureStatsTab>('overview');
  const onCloseRef = useRef(onClose);
  const { model, isLoading, isFetching, hasError, refetch, matchStarted } = useFixtureStats({ open, fixture, presentation });

  useBetLabScrollLock(open);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setActiveTab('overview');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const fixtureRecord = asRecord(fixture) ?? {};
  const homeScore = presentation?.homeScore ?? fixtureRecord.homeScore ?? '—';
  const awayScore = presentation?.awayScore ?? fixtureRecord.awayScore ?? '—';

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-950/70 p-1.5 backdrop-blur-sm sm:items-center sm:p-3"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fixture-stats-title"
        className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-[720px] flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl sm:max-h-[92dvh]"
      >
        <header className="flex shrink-0 items-center justify-between gap-1.5 border-b border-border/70 px-2.5 py-2 sm:px-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
              <FaChartSimple className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <h2 id="fixture-stats-title" className="text-[10px] font-extrabold sm:text-xs">Team statistics</h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {hasError ? (
              <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[7px] font-extrabold text-primary transition hover:bg-primary/10 disabled:opacity-50">
                <FaRotateRight className={`h-2.5 w-2.5 ${isFetching ? 'animate-spin' : ''}`} /> Retry
              </button>
            ) : null}
            <button type="button" onClick={onClose} aria-label="Close team statistics" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <FaXmark className="h-3 w-3" />
            </button>
          </div>
        </header>

        <div className="shrink-0 border-b border-border/60 bg-background/35 px-2.5 py-1.5 sm:px-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
            <StatsTeamBadge team={model.home} compact />
            <div className="flex min-w-[44px] flex-col items-center">
              {matchStarted ? (
                <strong className="text-xs font-black tabular-nums tracking-tight">{homeScore} <span className="text-muted-foreground/50">–</span> {awayScore}</strong>
              ) : <span className="text-[8px] font-black tracking-[0.16em] text-muted-foreground">VS</span>}
            </div>
            <StatsTeamBadge team={model.away} compact align="right" />
          </div>
        </div>

        <StatsTabBar active={activeTab} onChange={setActiveTab} showLive={matchStarted} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y p-2 sm:p-3 [-webkit-overflow-scrolling:touch]">
          {isLoading ? <LoadingState /> : (
            <div className="space-y-1.5">
              {activeTab === 'overview' ? <StatsOverviewPanel stats={model} /> : null}
              {activeTab === 'form' ? <TeamFormPanel home={model.home} away={model.away} /> : null}
              {activeTab === 'season' ? <SeasonComparisonPanel home={model.home} away={model.away} /> : null}
              {activeTab === 'h2h' ? <HeadToHeadPanel stats={model} /> : null}
              {activeTab === 'live' && matchStarted ? <LiveMatchStatsPanel home={model.home} away={model.away} stats={model.liveStats} /> : null}
              {hasError ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2 py-1.5">
                  <span className="text-[7px] font-medium text-muted-foreground">Some statistics could not be loaded.</span>
                  <button type="button" onClick={() => void refetch()} disabled={isFetching} className="shrink-0 text-[7px] font-extrabold text-primary disabled:opacity-50">{isFetching ? 'Loading…' : 'Retry'}</button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}



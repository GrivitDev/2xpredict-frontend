'use client';

import type { MouseEvent } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';
import type { HomeLeague } from './league-display';

type LeagueSelectorProps = {
  leagues: HomeLeague[];
  selected: string;
  onSelect: (leagueId: string) => void;
  showAll?: boolean;
  allLabel?: string;
  className?: string;
};

const chipBase =
  'inline-flex max-w-[132px] shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-semibold leading-none transition-colors lg:max-w-[190px]';

const activeChip =
  'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/10';

const inactiveChip =
  'border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground';

function LeagueLogo({ src, name }: { src?: string | null; name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase() || '?';

  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[7px] font-bold text-muted-foreground">
      {initials}
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full bg-card object-contain"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
    </span>
  );
}

export default function LeagueSelector({
  leagues,
  selected,
  onSelect,
  showAll = true,
  allLabel = 'All',
  className = '',
}: LeagueSelectorProps) {
  // Each homepage section supplies its own content-derived league list.
  // The control only limits how many of those section-specific leagues are visible.
  const showMoreOnMobile = leagues.length > 3;
  const showMoreOnDesktop = leagues.length > 5;

  const choose = (event: MouseEvent<HTMLButtonElement>, leagueId: string) => {
    onSelect(leagueId);
    const details = event.currentTarget.closest('details');
    if (details) details.open = false;
  };

  return (
    <div
      className={`relative z-20 mx-auto flex w-full min-w-0 flex-wrap items-center justify-center gap-1 ${className}`}
      role="group"
      aria-label="Select league"
    >
      {showAll ? (
        <button
          type="button"
          onClick={() => onSelect('ALL')}
          aria-pressed={selected === 'ALL'}
          className={`${chipBase} ${selected === 'ALL' ? activeChip : inactiveChip}`}
        >
          {allLabel}
        </button>
      ) : null}

      {leagues.map((item, index) => {
        // Three league chips on mobile, five on desktop. Remaining leagues
        // are available from More and are not mixed with another section.
        const visibility = index < 3
          ? 'league-selector__item--mobile'
          : index < 5
            ? 'league-selector__item--desktop'
            : 'league-selector__item--overflow';

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={selected === item.id}
            title={item.name}
            className={`${chipBase} league-selector__item ${visibility} ${selected === item.id ? activeChip : inactiveChip}`}
          >
            <LeagueLogo src={item.logo} name={item.name} />
            <span className="min-w-0 truncate">{item.name}</span>
          </button>
        );
      })}

      {showMoreOnMobile ? (
        <details className={`league-selector__more relative shrink-0 ${showMoreOnDesktop ? 'league-selector__more--desktop' : ''}`}>
          <summary
            className={`${chipBase} cursor-pointer list-none [&::-webkit-details-marker]:hidden ${inactiveChip}`}
            aria-label="More leagues"
            title="More leagues"
          >
            More <FaChevronDown className="text-[8px]" aria-hidden="true" />
          </summary>

          <div className="absolute left-1/2 top-full z-50 mt-1 w-[min(18rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-xl shadow-black/10">
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {showAll ? (
                <button
                  type="button"
                  onClick={(event) => choose(event, 'ALL')}
                  aria-pressed={selected === 'ALL'}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition-colors ${
                    selected === 'ALL' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold">All</span>
                  <span className="min-w-0 flex-1 truncate">{allLabel}</span>
                  {selected === 'ALL' ? <FaCheck className="shrink-0 text-[9px]" /> : null}
                </button>
              ) : null}

              {leagues.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => choose(event, item.id)}
                  aria-pressed={selected === item.id}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition-colors ${
                    selected === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <LeagueLogo src={item.logo} name={item.name} />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {selected === item.id ? <FaCheck className="shrink-0 text-[9px]" /> : null}
                </button>
              ))}
            </div>
          </div>
        </details>
      ) : null}

      <style jsx>{`
        .league-selector__item {
          display: none !important;
        }

        .league-selector__item--mobile {
          display: inline-flex !important;
        }

        .league-selector__more {
          display: inline-flex !important;
        }

        @media (min-width: 1024px) {
          .league-selector__item--mobile {
            display: none !important;
          }

          .league-selector__item--desktop {
            display: inline-flex !important;
          }

          .league-selector__more {
            display: none !important;
          }

          .league-selector__more--desktop {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}

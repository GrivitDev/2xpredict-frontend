'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaChevronDown,
  FaChevronRight,
  FaLock,
  FaTicketSimple,
  FaXmark,
} from 'react-icons/fa6';
import { firstValue, numeric, rowsFrom, text, type ApiRecord } from '@/lib/api-shapes';
import { getSlipProductRequiredPlan, normalizePredictionPlan, planMeetsPredictionRequirement } from '@/lib/prediction-access.utils';

export type PredictionSlipCategoryId =
  | 'ODDS_10'
  | 'ODDS_25'
  | 'ODDS_50'
  | 'SURE_2'
  | 'SURE_5'
  | 'SURE_7';

export type PredictionSlipCategory = {
  id: PredictionSlipCategoryId;
  label: string;
  requiredPlan: 'regular' | 'vip' | 'premium' | null;
  slips: ApiRecord[];
};

type Plan = 'anonymous' | 'free' | 'regular' | 'vip' | 'premium';

type Props = {
  slips: ApiRecord[];
  plan: Plan;
  policy: unknown;
  selectedCategory: PredictionSlipCategoryId;
  selectedSlipId: string;
  mobileOpen: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onSelectCategory: (category: PredictionSlipCategoryId) => void;
  onSelectSlip: (slip: ApiRecord) => void;
  onCloseMobile: () => void;
};

const categoryDefinitions: Array<{ id: PredictionSlipCategoryId; label: string }> = [
  { id: 'ODDS_10', label: '10 Odds Slips' },
  { id: 'ODDS_25', label: '25 Odds Slips' },
  { id: 'ODDS_50', label: '50 Odds Slips' },
  { id: 'SURE_2', label: '2 Odds Slips' },
  { id: 'SURE_5', label: '5 Odds Slips' },
  { id: 'SURE_7', label: '7 Odds Slips' },
];



function slipCategoryOf(slip: ApiRecord): PredictionSlipCategoryId | null {
  const type = text(firstValue(slip, ['productType']), '').toUpperCase();
  if (type === 'ODDS_10' || type === 'ODDS_25' || type === 'ODDS_50') return type;
  if (type !== 'SURE_ODDS' && firstValue(slip, ['sureOdds']) !== true) return null;

  const product = text(firstValue(slip, ['sureOddsProduct']), '').toUpperCase();
  if (product === 'SURE_2' || product === 'SURE_5' || product === 'SURE_7') return product;

  const tier = text(firstValue(slip, ['sureOddsTier']), '').toUpperCase();
  return tier === 'VIP' ? 'SURE_2' : tier === 'PREMIUM' ? 'SURE_5' : null;
}

function slipId(slip: ApiRecord) {
  return text(firstValue(slip, ['_id', 'id', 'slipId', 'slipCode']));
}

function slipIsLocked(slip: ApiRecord, plan: Plan, requiredPlan: Plan | null) {
  const accessRecord = firstValue(slip, ['access']) as ApiRecord | undefined;
  const slipRequiredPlan = normalizePredictionPlan(
    firstValue(slip, ['requiredPlan'], firstValue(accessRecord, ['requiredPlan'])),
  );
  const effectiveRequiredPlan = slipRequiredPlan ?? requiredPlan;
  return !planMeetsPredictionRequirement(plan, effectiveRequiredPlan) ||
    firstValue(slip, ['locked']) === true ||
    firstValue(slip, ['accessAllowed']) === false ||
    firstValue(accessRecord, ['allowed']) === false;
}

function slipOdds(slip: ApiRecord) {
  return numeric(firstValue(slip, ['combinedOdds', 'odds']), 0);
}

export default function PredictionSlipSelector({
  slips,
  plan,
  policy,
  selectedCategory,
  selectedSlipId,
  mobileOpen,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onSelectCategory,
  onSelectSlip,
  onCloseMobile,
}: Props) {
  const [expandedCategory, setExpandedCategory] = useState<PredictionSlipCategoryId>(selectedCategory);

  const categories = useMemo<PredictionSlipCategory[]>(() => {
    return categoryDefinitions.map((definition) => ({
      ...definition,
      requiredPlan: getSlipProductRequiredPlan(policy, definition.id),
      slips: slips.filter((slip) => slipCategoryOf(slip) === definition.id),
    }));
  }, [slips, policy]);

  const content = (
    <>
      <div className="border-b border-border/70 px-2.5 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-tight">
            <FaTicketSimple className="h-3.5 w-3.5 text-primary" /> Prediction slips
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
            {slips.length}
          </span>
        </div>
        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
          Browse published slips. Locked slips keep their selections hidden.
        </p>
      </div>

      <div className="max-h-[calc(100dvh-130px)] space-y-0.5 overflow-y-auto p-1 xl:max-h-[calc(100vh-120px)]">
        {categories.map((category) => {
          const expanded = expandedCategory === category.id;
          const active = selectedCategory === category.id;
          const categoryLocked = !planMeetsPredictionRequirement(plan, category.requiredPlan);
          const lockedCount = category.slips.filter((slip) =>
            slipIsLocked(slip, plan, category.requiredPlan),
          ).length;
          return (
            <section key={category.id} className="overflow-hidden rounded-lg border border-border/65 bg-background/30">
              <div className={`flex min-h-8 items-center gap-1 px-1.5 ${active ? 'bg-primary/10' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(category.id);
                    setExpandedCategory(category.id);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <FaTicketSimple className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">{category.label}</span>
                    <span className="block text-[9px] text-muted-foreground">
                      {category.slips.length} available {category.slips.length === 1 ? 'slip' : 'slips'}
                    </span>
                  </span>
                  {categoryLocked || lockedCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-500/10 px-1.5 py-1 text-[8px] font-bold text-amber-700 dark:text-amber-300">
                      <FaLock className="h-2.5 w-2.5" />
                      {category.slips.length > 0 ? lockedCount || category.slips.length : null}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(category.id);
                    setExpandedCategory(expanded ? ('' as PredictionSlipCategoryId) : category.id);
                  }}
                  aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category.label}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                >
                  {expanded ? <FaChevronDown className="h-2.5 w-2.5" /> : <FaChevronRight className="h-2.5 w-2.5" />}
                </button>
              </div>

              {expanded ? (
                <div className="space-y-0.5 border-t border-border/55 p-1">
                  {category.slips.length ? category.slips.map((slip, index) => {
                    const id = slipId(slip);
                    const selected = selectedSlipId === id;
                    const locked = slipIsLocked(slip, plan, category.requiredPlan);
                    const dateValue = firstValue(slip, ['fixtureDateFrom', 'generatedDateKey', 'createdAt']);
                    const date = dateValue ? new Date(String(dateValue)) : null;
                    const dateLabel = date && !Number.isNaN(date.getTime())
                      ? new Intl.DateTimeFormat('en-NG', { day: '2-digit', month: 'short' }).format(date)
                      : '';
                    return (
                      <button
                        key={id || `${category.id}-${index}`}
                        type="button"
                        onClick={() => {
                          onSelectSlip(slip);
                          onCloseMobile();
                        }}
                        className={`flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left transition ${
                          selected ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold">
                            {locked ? `Published slip ${index + 1}` : text(firstValue(slip, ['name', 'slipCode']), `Published slip ${index + 1}`)}
                          </span>
                          <span className="block text-[9px] text-muted-foreground">
                            {locked ? 'Subscription required' : `${numeric(firstValue(slip, ['legCount']), rowsFrom(slip.legs).length)} selections${dateLabel ? ` · ${dateLabel}` : ''}`}
                          </span>
                        </span>
                        {locked ? (
                          <FaLock className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-300" />
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold tabular-nums text-sky-700 dark:text-sky-300">
                            {slipOdds(slip) > 0 ? slipOdds(slip).toFixed(2) : '—'}
                          </span>
                        )}
                      </button>
                    );
                  }) : (
                    <div className="px-2.5 py-3 text-[9px] leading-4 text-muted-foreground">
                      No {category.label.toLowerCase()} are published for this date.
                    </div>
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
        {hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore || !onLoadMore}
            className="flex h-8 w-full items-center justify-center rounded-md border border-border bg-card px-2 text-[9px] font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60"
          >
            {loadingMore ? 'Loading more slips…' : 'Load more published slips'}
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-[66px] hidden min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card/80 shadow-[0_8px_28px_rgba(0,0,0,0.06)] backdrop-blur-xl xl:block">
        {content}
      </aside>

      {mobileOpen && typeof document !== 'undefined' ? createPortal(
        <div
          className="fixed inset-0 z-[9990] flex xl:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseMobile();
          }}
        >
          <aside className="flex h-full w-[min(88vw,360px)] flex-col overflow-hidden border-r border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <p className="text-xs font-bold">Choose slip type</p>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close slip selector"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <FaXmark className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{content}</div>
          </aside>
          <button
            type="button"
            aria-label="Close slip selector"
            onClick={onCloseMobile}
            className="flex-1 bg-black/55 backdrop-blur-[2px]"
          />
        </div>,
        document.body,
      ) : null}
    </>
  );
}



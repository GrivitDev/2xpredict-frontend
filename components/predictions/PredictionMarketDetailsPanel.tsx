'use client';

import Image from 'next/image';
import { FaXmark } from 'react-icons/fa6';
import { createPortal } from 'react-dom';
import { resolveTeamDisplayName, type MatchPresentation } from '@/hooks/use-match-presentation';
import { firstValue, numeric, text, type ApiRecord } from '@/lib/api-shapes';
import { formatPredictionOutcome, formatPredictionPrice, predictionConfidence, predictionOutcome, predictionPrice, predictionProbabilityPercent } from '@/lib/prediction-display';

type Props = {
  fixture: ApiRecord | null;
  /** Pick Center's stored selectedMarkets or Curated Prediction's selections. */
  selections: ApiRecord[];
  presentation?: MatchPresentation;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type Tone = 'good' | 'strong' | 'middle' | 'low' | 'neutral' | 'bad';

const TONE_CLASSES: Record<Tone, string> = {
  good: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  strong: 'border-lime-500/25 bg-lime-500/10 text-lime-700 dark:text-lime-300',
  middle: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  neutral: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  bad: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

const TEXT_TONES: Record<Tone, string> = {
  good: 'text-emerald-700 dark:text-emerald-300',
  strong: 'text-lime-700 dark:text-lime-300',
  middle: 'text-amber-700 dark:text-amber-300',
  low: 'text-orange-700 dark:text-orange-300',
  neutral: 'text-sky-700 dark:text-sky-300',
  bad: 'text-rose-700 dark:text-rose-300',
};

function probabilityPercent(selection: ApiRecord): number | null {
  return predictionProbabilityPercent(selection);
}

function confidenceValue(selection: ApiRecord): number | null {
  return predictionConfidence(selection);
}

/** Stored decimal price; estimated prices are explicitly marked and fairOdds is never an offer. */
function offeredOdds(selection: ApiRecord) {
  return predictionPrice(selection);
}

/**
 * Normalizes model probabilities to a 0..1 fraction.
 * The API may provide either a fraction (0.62) or a percentage (62).
 */
function probabilityFraction(value: unknown): number | null {
  const raw = numeric(value, Number.NaN);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  const fraction = raw > 1 ? raw / 100 : raw;
  return fraction > 0 && fraction <= 1 ? fraction : null;
}

function selectionProbability(selection: ApiRecord): number | null {
  const percent = predictionProbabilityPercent(selection);
  return percent === null ? null : percent / 100;
}

/**
 * When available, this must be the Prediction Engine's joint probability for
 * all selected outcomes in this fixture (not an average of their probabilities).
 */
function fixtureJointProbability(fixture: ApiRecord | null): number | null {
  return probabilityFraction(firstValue(
    fixture ?? {},
    ['sameMatchJointProbability', 'jointProbability'],
  ));
}

/** Keep exactly one recommended outcome for each market. Old Pick Center
 * documents can contain every eligible outcome from the same market. */
function oneSelectionPerMarket(rows: ApiRecord[]): ApiRecord[] {
  const bestByMarket = new Map<string, ApiRecord>();
  for (const row of rows) {
    const marketKey = text(firstValue(row, ['marketKey', 'marketCode']), '').trim().toUpperCase();
    const identity = marketKey || text(firstValue(row, ['selectionKey', 'key']), `row-${bestByMarket.size}`);
    const current = bestByMarket.get(identity);
    if (!current) {
      bestByMarket.set(identity, row);
      continue;
    }
    const score = numeric(firstValue(row, ['rankingScore']), Number.NEGATIVE_INFINITY);
    const currentScore = numeric(firstValue(current, ['rankingScore']), Number.NEGATIVE_INFINITY);
    const probability = numeric(firstValue(row, ['probability']), 0);
    const currentProbability = numeric(firstValue(current, ['probability']), 0);
    if (score > currentScore || (score === currentScore && probability > currentProbability)) {
      bestByMarket.set(identity, row);
    }
  }
  return [...bestByMarket.values()].sort((a, b) => {
    const rankA = numeric(firstValue(a, ['rank']), Number.MAX_SAFE_INTEGER);
    const rankB = numeric(firstValue(b, ['rank']), Number.MAX_SAFE_INTEGER);
    return rankA - rankB || text(firstValue(a, ['marketName'])).localeCompare(text(firstValue(b, ['marketName'])));
  });
}

function valueTone(value: number | null, kind: 'probability' | 'confidence'): Tone {
  if (value === null) return 'neutral';
  const thresholds = kind === 'probability'
    ? { good: 80, strong: 65, middle: 50, low: 40 }
    : { good: 85, strong: 75, middle: 65, low: 55 };
  if (value >= thresholds.good) return 'good';
  if (value >= thresholds.strong) return 'strong';
  if (value >= thresholds.middle) return 'middle';
  if (value >= thresholds.low) return 'low';
  return 'bad';
}

function settlementOf(selection: ApiRecord): string {
  const outcome = predictionOutcome(selection);
  return outcome === 'PENDING' ? 'SELECTED' : formatPredictionOutcome(outcome);
}

function settlementTone(value: string): Tone {
  if (value === 'WON' || value === 'HALF WON') return 'good';
  if (value === 'LOST' || value === 'HALF LOST') return 'bad';
  if (value === 'VOID' || value === 'PUSH') return 'middle';
  return 'neutral';
}

function matchStatus(fixture: ApiRecord, presentation?: MatchPresentation): { label: string; tone: Tone } {
  const raw = text(
    presentation?.status,
    text(firstValue(fixture, ['status', 'gameStatus', 'matchStatus']), ''),
  ).toUpperCase();
  if (/CANCEL|ABANDON|WALKOVER|NO_CONTEST/.test(raw)) return { label: 'CANCELLED', tone: 'bad' };
  if (/POSTPON|DELAY/.test(raw)) return { label: 'POSTPONED', tone: 'middle' };
  if (/FINAL|FINISHED|FULL[_ ]?TIME|COMPLETED/.test(raw) || fixture.completed === true) {
    return { label: 'FINISHED', tone: 'good' };
  }
  if (/LIVE|IN[_ ]?PLAY|IN[_ ]?PROGRESS|HALF[_ ]?TIME|HALFTIME|EXTRA[_ ]?TIME|SUSPENDED|INTERRUPTED/.test(raw) || fixture.live === true) {
    return { label: 'LIVE', tone: 'bad' };
  }
  return { label: 'UPCOMING', tone: 'neutral' };
}

function isMatchResultSelection(selection: ApiRecord): boolean {
  const key = text(firstValue(selection, ['marketKey', 'marketCode']), '').toUpperCase();
  const name = text(firstValue(selection, ['marketName']), '').toLowerCase();
  return firstValue(selection, ['isMatchResult']) === true ||
    /MATCH_RESULT|FULL_TIME_RESULT|MATCH_WINNER|MONEYLINE|1X2/.test(key) ||
    /match result|full.?time result|match winner|moneyline|1x2/.test(name);
}

function inferredFavourite(
  selections: ApiRecord[],
  homeName: string,
  awayName: string,
): { team: string; probability: number } | null {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const home = normalize(homeName);
  const away = normalize(awayName);
  if (!home || !away) return null;

  for (const selection of selections) {
    if (!isMatchResultSelection(selection)) continue;
    const key = normalize(text(firstValue(selection, ['selectionKey', 'key']), ''));
    const label = normalize(text(firstValue(selection, ['selectionName', 'fullName', 'abbreviation']), ''));
    const probability = probabilityPercent(selection);
    if (probability === null) continue;

    const homePick = label.includes(home) || ['home', 'homewin', '1', 'team1', 'teamhome'].includes(key);
    const awayPick = label.includes(away) || ['away', 'awaywin', '2', 'team2', 'teamaway'].includes(key);
    if (homePick === awayPick) continue;
    return { team: homePick ? homeName : awayName, probability };
  }
  return null;
}

function TeamLogo({ src, name }: { src?: string | null; name: string }) {
  if (src) return <Image src={src} alt="" width={20} height={20} unoptimized className="h-5 w-5 shrink-0 object-contain" />;
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground">
      {name.slice(0, 1).toUpperCase() || '?'}
    </span>
  );
}

export default function PredictionMarketDetailsPanel({
  fixture,
  selections,
  presentation,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const homeName = resolveTeamDisplayName(presentation?.homeTeamName, firstValue(fixture ?? {}, ['homeTeamName']));
  const awayName = resolveTeamDisplayName(presentation?.awayTeamName, firstValue(fixture ?? {}, ['awayTeamName']));
  const leagueId = text(firstValue(fixture ?? {}, ['leagueId', 'competitionId']), '');
  const leagueCandidates = [
    firstValue(fixture ?? {}, ['leagueDisplayName', 'competitionDisplayName']),
    presentation?.leagueName,
    firstValue(fixture ?? {}, ['leagueName', 'competitionName']),
  ].map((value) => text(value, '').trim()).filter(Boolean);
  const leagueName = leagueCandidates.find((value) =>
    value.toLowerCase() !== leagueId.toLowerCase() &&
    !/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value),
  ) ?? 'Football competition';
  const homeLogo = (presentation?.homeTeamLogo ?? text(firstValue(fixture ?? {}, ['homeTeamLogo', 'homeLogo']))) || null;
  const awayLogo = (presentation?.awayTeamLogo ?? text(firstValue(fixture ?? {}, ['awayTeamLogo', 'awayLogo']))) || null;
  const status = fixture ? matchStatus(fixture, presentation) : null;

  // Keep one recommended outcome per market. For same-match combinations,
  // price the intersection of outcomes from probability, not by multiplying
  // the displayed decimal prices. Prefer a true joint probability supplied by
  // the Prediction Engine. Until it is supplied, the product of marginal model
  // probabilities is shown only as an explicitly labelled independence estimate.
  const selectedPicks = oneSelectionPerMarket(selections);
  const selectedProbabilities = selectedPicks.map(selectionProbability);
  const engineJointProbability = fixtureJointProbability(fixture);
  const independentJointProbability = selectedPicks.length > 1 &&
    selectedProbabilities.every((value) => value !== null)
    ? selectedProbabilities.reduce((product, value) => product * (value ?? 1), 1)
    : null;
  const jointProbability = selectedPicks.length === 1
    ? null
    : engineJointProbability ?? independentJointProbability;
  const primarySelectionPrice = selectedPicks.length === 1 ? offeredOdds(selectedPicks[0]) : null;
  const combinedOdds = selectedPicks.length === 1
    ? primarySelectionPrice?.value ?? null
    : jointProbability !== null && jointProbability > 0
      ? 1 / jointProbability
      : null;
  const hasMultipleSelections = selectedPicks.length > 1;
  const combinedOddsIsEstimate = hasMultipleSelections && engineJointProbability === null && combinedOdds !== null;
  const combinedOddsTitle = !hasMultipleSelections
    ? (primarySelectionPrice?.source === 'ESTIMATED'
      ? 'Grivit model estimate; not a bookmaker offer.'
      : 'Stored Odds-module price for this market selection.')
    : engineJointProbability !== null
      ? 'Model fair odds derived from the Prediction Engine joint probability; not a bookmaker offer.'
      : 'Independence-based model fair odds from individual probabilities. Not correlation-adjusted and not a bookmaker offer.';
  const combinedOddsLabel = !hasMultipleSelections
    ? (primarySelectionPrice?.source === 'ESTIMATED' ? 'Estimated odds' : 'Odds')
    : engineJointProbability !== null ? 'Joint fair odds' : 'Estimated fair odds';
  const combinedOddsDisplay = hasMultipleSelections
    ? (combinedOdds === null ? '—' : `${combinedOddsIsEstimate ? '~' : ''}${combinedOdds.toFixed(2)}`)
    : primarySelectionPrice ? formatPredictionPrice(primarySelectionPrice) : '—';
  const favourite = inferredFavourite(selectedPicks, homeName, awayName);

  const content = (
    <>
      <div className="sticky top-0 z-100 flex items-center justify-between border-b border-border/70 bg-card/95 py-1 backdrop-blur-xl">
        <div className="flex items-center">
          {mobileOpen ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close pick details"
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted xl:hidden"
            >
              <FaXmark className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {fixture ? (
        <>
          <div className="border-b border-border/60 px-2 py-1.5">
            <p className="truncate text-[8px] font-semibold text-muted-foreground">{leagueName}</p>
            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1">
                <TeamLogo src={homeLogo} name={homeName} />
                <span className="truncate text-[9px] font-bold">{homeName}</span>
              </span>
              <span className="shrink-0 text-[8px] text-muted-foreground">vs</span>
              <span className="flex min-w-0 items-center justify-end gap-1">
                <span className="truncate text-right text-[9px] font-bold">{awayName}</span>
                <TeamLogo src={awayLogo} name={awayName} />
              </span>
            </div>
            {status ? (
              <div className="mt-1.5 flex items-center gap-1">
                <span className={`rounded border px-1.5 py-0.5 text-[7px] font-extrabold uppercase ${TONE_CLASSES[status.tone]}`}>
                  {status.label}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-2 py-1.5">
            <span
              className="text-[8px] font-semibold text-muted-foreground"
              title={combinedOddsTitle}
            >
              {combinedOddsLabel}
            </span>
            <div className="text-right">
              <strong
                className="text-sm font-black tabular-nums text-sky-700 dark:text-sky-300"
                title={combinedOddsTitle}
              >
                {combinedOddsDisplay}
              </strong>
              {hasMultipleSelections ? (
                <span className="block text-[7px] leading-3 text-amber-600 dark:text-amber-400">
                  Model fair price · not a bookmaker offer{combinedOddsIsEstimate ? ' · independence estimate' : ''}
                </span>
              ) : primarySelectionPrice?.source === 'ESTIMATED' ? (
                <span className="block text-[7px] leading-3 text-amber-600 dark:text-amber-400">Grivit estimate · not a bookmaker offer</span>
              ) : null}
            </div>
          </div>

          {favourite ? (
            <div className="border-b border-border/60 px-2 py-1.5 text-[9px] leading-4">
              This prediction favours <strong className="font-extrabold text-emerald-600 dark:text-emerald-400">{favourite.team}</strong> to win with{' '}
              <strong className={TEXT_TONES[valueTone(favourite.probability, 'probability')]}>{Math.round(favourite.probability)}% probability</strong>.
            </div>
          ) : null}

          <div className="space-y-0.5 p-1">
            {selectedPicks.map((selection, index) => {
              const odds = offeredOdds(selection);
              const probability = probabilityPercent(selection);
              const confidence = confidenceValue(selection);
              const outcome = settlementOf(selection);
              const marketName = text(firstValue(selection, ['marketName', 'marketFullName']), 'Selected market');
              const selectionName = text(firstValue(selection, ['selectionName', 'fullName', 'selectionAbbreviation']), 'Selection');
              return (
                <div
                  key={`${text(firstValue(selection, ['marketKey', 'marketName']), 'market')}-${text(firstValue(selection, ['selectionKey', 'selectionName']), String(index))}`}
                  className="rounded-md border border-border/60 bg-background/55 px-1.5 py-1"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="min-w-0 truncate text-[9px] font-bold text-foreground">{marketName}</span>
                    <span className={`shrink-0 rounded border px-1 py-0.5 text-[7px] font-bold uppercase ${TONE_CLASSES[settlementTone(outcome)]}`}>
                      {outcome}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-1.5">
                    <span className="min-w-0 truncate text-[9px] font-semibold">{selectionName}</span>
                    <span className="text-right">
                      <span className="block text-[8px] text-muted-foreground">{odds.source === 'ESTIMATED' ? 'Est. odds' : 'Odds'}</span>
                      <strong title={odds.source === 'ESTIMATED' ? 'Grivit model estimate; not a bookmaker offer.' : odds.source === 'PROVIDER' ? 'Provider-backed price.' : 'Stored Odds-module price.'} className="text-[10px] font-extrabold tabular-nums text-sky-700 dark:text-sky-300">
                        {formatPredictionPrice(odds)}
                      </strong>
                    </span>
                    <span className="text-right">
                      <span className="block text-[8px] text-muted-foreground">Probability</span>
                      <strong className={`text-[10px] font-extrabold tabular-nums ${TEXT_TONES[valueTone(probability, 'probability')]}`}>
                        {probability === null ? '—' : `${Math.round(probability)}%`}
                      </strong>
                    </span>
                    <span className="text-right">
                      <span className="block text-[8px] text-muted-foreground">Confidence</span>
                      <strong className={`text-[10px] font-extrabold tabular-nums ${TEXT_TONES[valueTone(confidence, 'confidence')]}`}>
                        {confidence === null ? '—' : `${Math.round(confidence)}%`}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="px-2 py-5 text-center">
          <p className="text-[9px] font-semibold text-muted-foreground">Select a match</p>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className="sticky top-[66px] hidden max-h-[calc(100dvh-76px)] min-w-0 overflow-y-auto overscroll-auto rounded-lg border border-border/80 bg-card/80 shadow-[0_5px_18px_rgba(0,0,0,0.05)] backdrop-blur-xl xl:block">
        {content}
      </aside>

      {mobileOpen && typeof document !== 'undefined' ? createPortal(
        <div
          className="fixed inset-0 z-[9995] flex justify-end xl:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseMobile();
          }}
        >
          <button
            type="button"
            aria-label="Close pick details"
            onClick={onCloseMobile}
            className="flex-1 bg-black/55 backdrop-blur-[2px]"
          />
          <aside className="flex h-full w-[min(92vw,420px)] flex-col overflow-hidden border-l border-border bg-card shadow-2xl">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-auto">{content}</div>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}




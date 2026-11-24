'use client';

import Image from 'next/image';
import { FaChartSimple, FaListCheck } from 'react-icons/fa6';
import { resolveTeamDisplayName, type MatchPresentation } from '@/hooks/use-match-presentation';
import { firstValue, numeric, text, type ApiRecord } from '@/lib/api-shapes';
import { formatPredictionOutcome, formatPredictionPrice, predictionConfidence, predictionOutcome, predictionPrice, predictionProbabilityPercent } from '@/lib/prediction-display';

type Props = {
  fixture: ApiRecord;
  selections: ApiRecord[];
  selectedMarketName: string;
  presentation?: MatchPresentation;
  selected?: boolean;
  onSelect: (eventId: string) => void;
  onOpenStats: (eventId: string) => void;
  onInspectMarkets: (eventId: string) => void;
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

function matchStatusMeta(fixture: ApiRecord, presentation?: MatchPresentation) {
  const raw = text(
    presentation?.status,
    text(firstValue(fixture, ['status', 'gameStatus', 'matchStatus']), ''),
  ).toUpperCase();
  if (/CANCEL|ABANDON|WALKOVER|NO_CONTEST/.test(raw)) return { label: 'CANCELLED', tone: 'bad' as Tone };
  if (/POSTPON|DELAY/.test(raw)) return { label: 'POSTPONED', tone: 'middle' as Tone };
  if (/FINAL|FINISHED|FULL[_ ]?TIME|COMPLETED/.test(raw) || fixture.completed === true) {
    return { label: 'FINISHED', tone: 'good' as Tone };
  }
  if (/LIVE|IN[_ ]?PLAY|IN[_ ]?PROGRESS|HALF[_ ]?TIME|HALFTIME|EXTRA[_ ]?TIME|SUSPENDED|INTERRUPTED/.test(raw) || fixture.live === true) {
    return { label: 'LIVE', tone: 'bad' as Tone };
  }
  return { label: 'UPCOMING', tone: 'neutral' as Tone };
}

function offeredOdds(selection: ApiRecord) {
  const price = predictionPrice(selection);
  return { text: formatPredictionPrice(price), title: predictionPriceLabelSafe(price) };
}

function predictionPriceLabelSafe(price: ReturnType<typeof predictionPrice>): string {
  if (price.source === 'ESTIMATED') return 'Grivit model estimate; not a bookmaker offer.';
  if (price.source === 'PROVIDER') return price.bookmaker ? `Provider price from ${price.bookmaker}.` : 'Provider-backed odds.';
  return 'Stored Odds-module price; source not specified.';
}

function TeamLogo({ src, name }: { src?: string | null; name: string }) {
  return src ? (
    <Image src={src} alt="" width={14} height={14} unoptimized className="h-3.5 w-3.5 shrink-0 object-contain" />
  ) : (
    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-muted text-[6px] font-bold text-muted-foreground">
      {name.slice(0, 1).toUpperCase() || '?'}
    </span>
  );
}

function kickoffLabel(value: unknown): string {
  const date = new Date(String(value ?? ''));
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function scoreValue(presentationValue: number | null | undefined, fixture: ApiRecord, keys: string[]): number | string {
  if (presentationValue !== null && presentationValue !== undefined && Number.isFinite(Number(presentationValue))) {
    return Number(presentationValue);
  }
  const value = firstValue(fixture, keys);
  return value === undefined || value === null || value === '' ? '—' : numeric(value, 0);
}

function displayLeagueName(fixture: ApiRecord, presentation?: MatchPresentation): string {
  const leagueId = text(firstValue(fixture, ['leagueId', 'competitionId']), '');
  const candidates = [
    firstValue(fixture, ['leagueDisplayName', 'competitionDisplayName']),
    presentation?.leagueName,
    firstValue(fixture, ['leagueName', 'competitionName']),
  ].map((value) => text(value, '').trim()).filter(Boolean);
  return candidates.find((value) =>
    value.toLowerCase() !== leagueId.toLowerCase() &&
    !/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value),
  ) ?? 'Football competition';
}

export default function PredictionMatchCard({
  fixture,
  selections,
  presentation,
  selected = false,
  onSelect,
  onOpenStats,
  onInspectMarkets,
}: Props) {
  const eventId = text(firstValue(fixture, ['eventId', 'fixtureId', 'id', '_id']));
  const homeName = resolveTeamDisplayName(presentation?.homeTeamName, firstValue(fixture, ['homeTeamName', 'homeName']));
  const awayName = resolveTeamDisplayName(presentation?.awayTeamName, firstValue(fixture, ['awayTeamName', 'awayName']));
  const homeLogo = (presentation?.homeTeamLogo ?? text(firstValue(fixture, ['homeTeamLogo', 'homeLogo']))) || null;
  const awayLogo = (presentation?.awayTeamLogo ?? text(firstValue(fixture, ['awayTeamLogo', 'awayLogo']))) || null;
  const leagueName = displayLeagueName(fixture, presentation);
  const leagueLogo = (presentation?.leagueLogo ?? text(firstValue(fixture, ['leagueLogo', 'competitionLogo']))) || null;
  const fixtureDate = firstValue(fixture, ['fixtureDate', 'matchDate', 'startTime', 'kickoff']);
  const status = matchStatusMeta(fixture, presentation);
  const homeScore = scoreValue(presentation?.homeScore, fixture, ['homeScore', 'homeTeamScore']);
  const awayScore = scoreValue(presentation?.awayScore, fixture, ['awayScore', 'awayTeamScore']);

  return (
    <article className={`overflow-hidden rounded-md border bg-card/90 transition ${
      selected ? 'border-primary/45 ring-1 ring-primary/15' : 'border-border/75 hover:border-primary/25'
    }`}>
      <header className="flex min-h-7 min-w-0 items-center gap-3.5 border-b border-border/60 px-1.5">
        <button
          type="button"
          onClick={() => eventId && onSelect(eventId)}
          title={leagueName}
          aria-label={`${leagueName}, ${kickoffLabel(fixtureDate)}, ${status.label}`}
          className="flex min-w-0 flex-1 items-center gap-1 text-left"
        >
          {leagueLogo ? (
            <Image src={leagueLogo} alt="" width={14} height={14} unoptimized className="h-3.5 w-3.5 shrink-0 object-contain" />
          ) : (
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary/70" />
          )}
          <span className="min-w-0 truncate text-[9px] font-bold text-foreground sm:text-[10px]">{leagueName}</span>
        </button>
        <span className="shrink-0 border-l border-border/70 pl-1 text-[9px] tabular-nums text-muted-foreground sm:text-[9px]">
          {kickoffLabel(fixtureDate)}
        </span>
        <span className={`shrink-0 rounded border px-1 py-0.5 text-[7px] font-extrabold uppercase tracking-wide sm:text-[8px] ${TONE_CLASSES[status.tone]}`}>
          {status.label}
        </span>
        <button
          type="button"
          onClick={() => eventId && onOpenStats(eventId)}
          title="Match statistics"
          aria-label="Match statistics"
          className="inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded border border-border bg-background/70 px-1 text-primary transition hover:border-primary/35 sm:px-1.5"
        >
          <FaChartSimple className="h-2.5 w-2.5" />
          <span className=" text-[9px] font-bold sm:inline">Stats</span>
        </button>
        <button
          type="button"
          onClick={() => eventId && onInspectMarkets(eventId)}
          title="Pick details"
          aria-label="Pick details"
          className="inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded bg-primary/10 px-1 text-primary transition hover:bg-primary/15 sm:px-1.5"
        >
          <FaListCheck className="h-2.5 w-2.5" />
          <span className="text-[9px] font-extrabold sm:inline">All Picks</span>
        </button>
      </header>

      <div className="grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-1 px-1.5 py-1">
        <button
          type="button"
          onClick={() => eventId && onSelect(eventId)}
          className="min-w-0 space-y-1 text-left"
        >
          <span className="flex min-w-0 items-center gap-1">
            <TeamLogo src={homeLogo} name={homeName} />
            <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-foreground">{homeName}</span>
            <strong className="shrink-0 text-[9px] font-black tabular-nums text-foreground">: {homeScore}</strong>
          </span>
          <span className="flex min-w-0 items-center gap-1">
            <TeamLogo src={awayLogo} name={awayName} />
            <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-foreground">{awayName}</span>
            <strong className="shrink-0 text-[9px] font-black tabular-nums text-foreground">: {awayScore}</strong>
          </span>
        </button>

        <div className="min-w-0 space-y-0.5">
          {selections.length ? selections.map((selection, index) => {
            const probability = probabilityPercent(selection);
            const confidence = confidenceValue(selection);
            const odds = offeredOdds(selection);
            const outcome = predictionOutcome(selection);
            const selectionName = text(firstValue(selection, ['selectionName', 'fullName', 'name']), 'Prediction');
            return (
              <div
                key={`${text(firstValue(selection, ['marketKey', 'marketName']), 'market')}-${text(firstValue(selection, ['selectionKey', 'key', 'selectionName']), String(index))}`}
                className="min-w-0 rounded border border-border/55 bg-background/55 px-3"
              >
                <div className=" grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-4">
                  <span className="flex min-w-0 items-center gap-1" title={selectionName}>
                    <span className="min-w-0 truncate text-[9px] font-semibold text-foreground">{selectionName}</span>
                    {outcome !== 'PENDING' ? (
                      <span className={`shrink-0 rounded border px-1 py-0.5 text-[7px] font-extrabold uppercase ${TONE_CLASSES[outcome === 'WON' || outcome === 'HALF_WON' ? 'good' : outcome === 'LOST' || outcome === 'HALF_LOST' ? 'bad' : 'middle']}`}>
                        {formatPredictionOutcome(outcome)}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right">
                    <span className="block text-[8px] text-muted-foreground">{odds.text.startsWith('~') ? 'Est. odds' : 'Odds'}</span>
                    <strong title={odds.title} className="text-[10px] font-extrabold tabular-nums text-sky-700 dark:text-sky-300">{odds.text}</strong>
                  </span>
                  <span className="text-right">
                    <span className="block text-[8px] text-muted-foreground">Prob.</span>
                    <strong className={`text-[10px] font-extrabold tabular-nums ${TEXT_TONES[valueTone(probability, 'probability')]}`}>
                      {probability === null ? '—' : `${Math.round(probability)}%`}
                    </strong>
                  </span>
                  <span className="text-right">
                    <span className="block text-[8px] text-muted-foreground">Conf.</span>
                    <strong className={`text-[10px] font-extrabold tabular-nums ${TEXT_TONES[valueTone(confidence, 'confidence')]}`}>
                      {confidence === null ? '—' : `${Math.round(confidence)}%`}
                    </strong>
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="rounded border border-dashed border-border/70 px-1 py-1 text-center">
              <p className="text-[8px] font-semibold text-foreground">No pick for this market</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


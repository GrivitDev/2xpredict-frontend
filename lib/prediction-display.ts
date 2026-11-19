export type PredictionOutcomeCode =
  | 'PENDING'
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'PUSH'
  | 'HALF_WON'
  | 'HALF_LOST';

export type PredictionPriceSource = 'PROVIDER' | 'ESTIMATED' | 'UNKNOWN';

export interface PredictionPriceView {
  value: number | null;
  source: PredictionPriceSource;
  bookmaker?: string;
}

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Backend probability is a fraction; probabilityPercent is already 0–100. */
export function predictionProbabilityPercent(selection: Record<string, unknown>): number | null {
  const percent = finiteNumber(selection.probabilityPercent);
  if (percent !== null) return percent >= 0 && percent <= 100 ? percent : null;

  const probability = finiteNumber(selection.probability);
  if (probability === null || probability < 0) return null;
  const normalized = probability <= 1 ? probability * 100 : probability;
  return normalized <= 100 ? normalized : null;
}

/** Confidence is a 0–98 score, not a probability fraction. */
export function predictionConfidence(selection: Record<string, unknown>): number | null {
  const confidence = finiteNumber(selection.confidence)
    ?? finiteNumber(selection.evidenceConfidence);
  return confidence !== null && confidence >= 0 && confidence <= 98 ? confidence : null;
}

/** decimalOdds is the Odds-module price. fairOdds is never treated as an offered price. */
export function predictionPrice(selection: Record<string, unknown>): PredictionPriceView {
  const decimalOdds = finiteNumber(selection.decimalOdds);
  const bookmakerOdds = finiteNumber(selection.bookmakerOdds);
  const priceType = String(selection.priceType ?? '').trim().toUpperCase();

  if (decimalOdds !== null && decimalOdds > 1) {
    return {
      value: decimalOdds,
      source: priceType === 'ESTIMATED' ? 'ESTIMATED' : priceType === 'PROVIDER' ? 'PROVIDER' : 'UNKNOWN',
      bookmaker: typeof selection.bookmaker === 'string' ? selection.bookmaker : undefined,
    };
  }

  // bookmakerOdds is explicitly a provider quote in the backend schemas.
  if (bookmakerOdds !== null && bookmakerOdds > 1) {
    return {
      value: bookmakerOdds,
      source: 'PROVIDER',
      bookmaker: typeof selection.bookmaker === 'string' ? selection.bookmaker : undefined,
    };
  }

  return { value: null, source: 'UNKNOWN' };
}

export function formatPredictionPrice(price: PredictionPriceView): string {
  if (price.value === null) return '—';
  const prefix = price.source === 'ESTIMATED' ? '~' : '';
  return `${prefix}${price.value.toFixed(2)}`;
}

export function predictionPriceLabel(price: PredictionPriceView): string {
  if (price.source === 'ESTIMATED') return 'Grivit estimate';
  if (price.source === 'PROVIDER') return price.bookmaker?.trim() || 'Provider price';
  return 'Odds-module price';
}

const SETTLED_OUTCOMES = new Set<PredictionOutcomeCode>([
  'WON', 'LOST', 'VOID', 'PUSH', 'HALF_WON', 'HALF_LOST',
]);

export function predictionOutcome(selection: Record<string, unknown>): PredictionOutcomeCode {
  const candidates = [
    selection.actualOutcome,
    selection.settlementOutcome,
    selection.settlementStatus,
    selection.matchSettlementStatus,
  ];
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim().toUpperCase();
    if (value === 'PENDING' || SETTLED_OUTCOMES.has(value as PredictionOutcomeCode)) {
      return value as PredictionOutcomeCode;
    }
  }
  return 'PENDING';
}

export function isSettledPredictionOutcome(value: unknown): value is Exclude<PredictionOutcomeCode, 'PENDING'> {
  return SETTLED_OUTCOMES.has(String(value ?? '').trim().toUpperCase() as PredictionOutcomeCode);
}

export function formatPredictionOutcome(value: unknown): string {
  const outcome = String(value ?? 'PENDING').trim().toUpperCase();
  return outcome.replaceAll('_', ' ');
}

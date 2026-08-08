import type { ExternalAdPolicy } from '../types/external-ad-policy';

export interface ExternalAdFrequencyState {
  lastShownAt: number | null;
}

const FREQUENCY_INTERVALS: Record<
  ExternalAdPolicy['frequency'],
  number
> = {
  NONE: Infinity,
  LOW: 180_000,
  NORMAL: 60_000,
};

/**
 * Returns the minimum interval required between
 * external advertisements for the supplied frequency.
 *
 * The backend's refreshInterval remains the authoritative
 * value when available. These values act as safe client-side
 * defaults.
 */
export function getFrequencyInterval(
  frequency: ExternalAdPolicy['frequency'],
  refreshInterval?: number,
): number {
  if (frequency === 'NONE') {
    return Infinity;
  }

  if (
    typeof refreshInterval === 'number' &&
    Number.isFinite(refreshInterval) &&
    refreshInterval >= 0
  ) {
    return refreshInterval * 1000;
  }

  return FREQUENCY_INTERVALS[frequency];
}

/**
 * Determines whether an external advertisement can
 * currently be shown.
 */
export function canShowExternalAd(
  policy: ExternalAdPolicy | null,
  lastShownAt: number | null,
  now = Date.now(),
): boolean {
  if (!policy?.enabled) {
    return false;
  }

  if (policy.frequency === 'NONE') {
    return false;
  }

  const interval = getFrequencyInterval(
    policy.frequency,
    policy.refreshInterval,
  );

  if (!Number.isFinite(interval)) {
    return false;
  }

  if (
    lastShownAt === null ||
    !Number.isFinite(lastShownAt)
  ) {
    return true;
  }

  return (
    now - lastShownAt >= interval
  );
}

/**
 * Returns the remaining time before another
 * external advertisement may be shown.
 */
export function getRemainingFrequencyMs(
  policy: ExternalAdPolicy | null,
  lastShownAt: number | null,
  now = Date.now(),
): number {
  if (!policy?.enabled) {
    return Infinity;
  }

  if (policy.frequency === 'NONE') {
    return Infinity;
  }

  if (
    lastShownAt === null ||
    !Number.isFinite(lastShownAt)
  ) {
    return 0;
  }

  const interval =
    getFrequencyInterval(
      policy.frequency,
      policy.refreshInterval,
    );

  if (!Number.isFinite(interval)) {
    return Infinity;
  }

  return Math.max(
    0,
    interval -
      (now - lastShownAt),
  );
}

/**
 * Returns the remaining time in seconds.
 */
export function getRemainingFrequencySeconds(
  policy: ExternalAdPolicy | null,
  lastShownAt: number | null,
  now = Date.now(),
): number {
  const remaining =
    getRemainingFrequencyMs(
      policy,
      lastShownAt,
      now,
    );

  if (!Number.isFinite(remaining)) {
    return Infinity;
  }

  return Math.ceil(
    remaining / 1000,
  );
}
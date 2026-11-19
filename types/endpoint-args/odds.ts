import type { OddsCenterDateRange } from '../odds-center';

export interface GetOddsCenterArgs {
  query: OddsCenterDateRange;
}

export interface GetOddsMonitorArgs {
  query?: {
    /** Bypass the monitor's 15-second in-memory response cache. */
    refresh?: boolean;
  };
}

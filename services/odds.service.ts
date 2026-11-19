/** Single client for the Odds module's read-only center and operational monitor. */
import { apiRequest } from '../lib/axios';
import type { GetOddsCenterArgs, GetOddsMonitorArgs } from '../types/endpoint-args/odds';
import type { OddsCenterResponse, OddsMonitorResponse } from '../types/odds-center';

const getOddsMonitor = (args: GetOddsMonitorArgs = {}): Promise<OddsMonitorResponse> =>
  apiRequest<OddsMonitorResponse>({
    method: 'GET',
    path: '/odds/admin/monitor',
    query: args.query,
  });

export const oddsService = {
  getOddsCenter: (args: GetOddsCenterArgs): Promise<OddsCenterResponse> =>
    apiRequest<OddsCenterResponse>({
      method: 'GET',
      path: '/odds/admin/center',
      query: args.query,
    }),
  getOddsMonitor,
  getMonitor: getOddsMonitor,
} as const;

